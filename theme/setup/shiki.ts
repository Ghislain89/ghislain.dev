/* ./setup/shiki.ts */
import { defineShikiSetup } from '@slidev/types'
import PenguinTheme from './theme/penguin-theme.json'

export default defineShikiSetup(() => ({
  theme: PenguinTheme,
  // Without this list Slidev bundles all ~200 Shiki languages: hundreds of extra
  // files to upload. Add a language here before using it in a code block.
  langs: ['typescript', 'javascript', 'shellscript', 'yaml', 'json'],
}))
