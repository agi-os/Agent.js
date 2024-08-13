// List of workers that can process a queue of tasks.
const workerList = [
  'nameGenerator',
  'downloadSubtitles',
  'convertSubtitles',
  'chunkSubtitles',
  'sponsorBlock',
  'llmToJsonGroq',
  'llmToJsonOpenrouter',
  'llmToJsonHuggingFace',
]

export default workerList
