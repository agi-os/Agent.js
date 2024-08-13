import llmToJsonGroq from './workers/job/llmToJsonGroq.js'
import llmToJsonOpenrouter from './workers/job/llmToJsonOpenrouter.js'
import llmToJsonHuggingFace from './workers/job/llmToJsonHuggingFace.js'

async function main() {
  const inputText =
    '\n00:00 - "News Overload Intensity"\n\n*01:06 - "Colombia\nPeace Effort"\n\n*02:12 - "Militaristic   Approach Failed"\n\nand then:\n\n* 03:18 - "Initial Peace Progress"\n04:24= "Violence Resurges Again"\n05:30 - "Conflict Bad Faith"'

  const jsonArrayKeys = 'start <string mm:ss>, title <string>'

  const inputText0 =
    ' "\n06:36 - "Gulf Clan Exclusion"\n07:42 - "Bad Faith Talks"\n08:48 - "Petro\'s Approval Falls"\n09:48 - "Ongoing Peace Hope"'

  await llmToJsonGroq({ inputText, jsonArrayKeys })
  await llmToJsonGroq({ inputText: inputText0, jsonArrayKeys })

  await llmToJsonOpenrouter({ inputText, jsonArrayKeys })
  await llmToJsonOpenrouter({ inputText: inputText0, jsonArrayKeys })

  await llmToJsonHuggingFace({ inputText, jsonArrayKeys })
  await llmToJsonHuggingFace({ inputText: inputText0, jsonArrayKeys })
}

await main()

// quit process
process.exit(0)
