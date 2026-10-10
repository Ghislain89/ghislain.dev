# Theme

Shared Slidev theme for both decks. It is based on [slidev-theme-penguin](https://github.com/alvarosaburido/slidev-theme-penguin) by Alvaro Saburido, licensed under MIT.

Layouts: `default`, `intro`, `new-section`, `presenter`, `text-image`, `text-window`, `two-cols`, `two-thirds`.

`components/AsGraphic.vue` (the decorative shapes) is adapted from [@alvarosabu/ui](https://www.npmjs.com/package/@alvarosabu/ui) (MIT). It is copied rather than imported because importing the package also bundled every Shiki language and theme into the build. For the same reason, `setup/shiki.ts` lists the code languages the decks use: add a language there before using it in a code block.
