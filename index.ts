import '@logseq/libs';
import SettingSchemaDesc from '@logseq/libs/dist/LSPlugin.user';

var choices = ["Entire graph","Limit to tag"]
const settingsTemplate:SettingSchemaDesc[] = [{
    key: "level",
    type: 'number',
    default: 3,
    title: "Title level?",
    description: "Insert timestamped heading level, default to 3 (### HH:MM title)",
  }
]
logseq.useSettingsSchema(settingsTemplate)

async function updateBlock(block) {
    var today = new Date();
    var time = today.getHours() + ":" + today.getMinutes();
    var level = logseq.settings.level
      let content = /^#{1,6}\s+/.test(block.content)
        ? block.content.replace(/^#{1,6}\s+/, '')
        : block.content;
        console.log("A",logseq.settings.level)
        await logseq.Editor.updateBlock(
          block.uuid,
          '#'.repeat(logseq.settings.level) + ' ' + time + ' ' + content
        );
}

async function setLevel() {
  const selected = await logseq.Editor.getSelectedBlocks();
  if (selected && selected.length > 1) {
    for (let block of selected) {
        updateBlock(block)
         }
  } else {
    const block = await logseq.Editor.getCurrentBlock();
    if (block?.uuid) {
        updateBlock(block)
    }
  }
}

async function main() {
    logseq.App.registerCommandPalette(
      {
        key: `interstial-time-stamp`,
        label: `Insert interstitial heading`,
        keybinding: {
          mode: 'global',
          binding: 'mod+t',
        },
      },
      async () => {
        await setLevel();
      }
    );
}

logseq.ready(main).catch(console.error);
