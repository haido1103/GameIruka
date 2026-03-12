export async function startRecording() {
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    throw new Error('getUserMedia not supported')
  }

  const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
  const mimeType = MediaRecorder && MediaRecorder.isTypeSupported && MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
    ? 'audio/webm;codecs=opus'
    : (MediaRecorder && MediaRecorder.isTypeSupported && MediaRecorder.isTypeSupported('audio/ogg') ? 'audio/ogg' : '')

  const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined)
  const chunks = []
  let startTs = Date.now()

  recorder.ondataavailable = (e) => { if (e.data && e.data.size) chunks.push(e.data) }
  recorder.start()

  return {
    stop: () => new Promise((resolve) => {
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: mimeType || 'audio/webm' })
        const durationMs = Date.now() - startTs
        stream.getTracks().forEach(t => t.stop())
        resolve({ blob, durationMs })
      }
      recorder.stop()
    }),
    recorder,
    stream
  }
}
