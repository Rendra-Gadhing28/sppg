// Client-side helper for face detection and embedding extraction
let modelsLoaded = false;
let loadingPromise: Promise<boolean> | null = null;

export async function getFaceApi() {
  if (typeof window === "undefined") {
    throw new Error("face-api hanya dapat dijalankan di browser (client-side).");
  }
  const faceapi = await import("@vladmandic/face-api");
  return faceapi;
}

export async function loadFaceModels(modelsPath = "/models"): Promise<boolean> {
  if (typeof window === "undefined") return false;
  if (modelsLoaded) return true;
  if (loadingPromise) return loadingPromise;

  loadingPromise = (async () => {
    try {
      const faceapi = await getFaceApi();
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(modelsPath),
        faceapi.nets.faceLandmark68TinyNet.loadFromUri(modelsPath),
        faceapi.nets.faceRecognitionNet.loadFromUri(modelsPath),
      ]);
      modelsLoaded = true;
      return true;
    } catch (err) {
      console.error("Gagal memuat model face-api:", err);
      modelsLoaded = false;
      return false;
    } finally {
      loadingPromise = null;
    }
  })();

  return loadingPromise;
}

export async function extractFaceVector(
  input: HTMLVideoElement | HTMLCanvasElement | HTMLImageElement
): Promise<number[] | null> {
  if (typeof window === "undefined") return null;

  const isLoaded = await loadFaceModels();
  if (!isLoaded) {
    throw new Error("Model biometrik wajah belum siap atau gagal dimuat.");
  }

  const faceapi = await getFaceApi();
  const options = new faceapi.TinyFaceDetectorOptions({
    inputSize: 320,
    scoreThreshold: 0.5,
  });

  const detection = await faceapi
    .detectSingleFace(input, options)
    .withFaceLandmarks(true)
    .withFaceDescriptor();

  if (!detection || !detection.descriptor) {
    return null;
  }

  return Array.from(detection.descriptor);
}
