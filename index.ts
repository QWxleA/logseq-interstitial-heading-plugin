import '@logseq/libs';
import SettingSchemaDesc from '@logseq/libs/dist/LSPlugin.user';

var simple = true;

const settingsTemplate:SettingSchemaDesc[] = [{
    key: "defaultTitle",
    type: 'boolean',
    default: false,
    title: "Insert Header by default?",
    description: "If true, \"<mod> t\" will insert a header, otherwise only the time",
   },{
    key: "level",
    type: 'number',
    default: 3,
    title: "Title level?",
    description: "Insert timestamped heading level, default to 3 (### HH:MM title)",
    }
]
logseq.useSettingsSchema(settingsTemplate)

async function updateBlock(block,simple) {
    let content = /^#{1,6}\s+/.test(block.content)
        ? block.content.replace(/^#{1,6}\s+/, '')
        : block.content;
    var today = new Date();
    let time = today.getHours() + ":" + today.getMinutes()
    let timestamp = simple ? ' ' + time + ' ' : '**' + time + '** '
    let header = simple ? '#'.repeat(logseq.settings.level) : ''
    await logseq.Editor.updateBlock(
            block.uuid,
            header + timestamp + content
            );
}

async function insertInterstitional(simple) {
  const selected = await logseq.Editor.getSelectedBlocks();
  if (selected && selected.length > 1) {
    for (let block of selected) {
        updateBlock(block, simple)
         }
  } else {
    const block = await logseq.Editor.getCurrentBlock();
    if (block?.uuid) {
        updateBlock(block, simple)
    }
  }
}

async function main() {
    //logseq.Editor.registerSlashCommand('Create SmartBlock (guided)', async () => {
    //  await logseq.Editor.insertAtEditingCursor(`{{renderer :smartblock, template name, button title, sibling?}} `);
      // templaterBlock = await logseq.Editor.getCurrentBlock();
    //});

    logseq.App.registerCommandPalette(
      {
        key: `interstial-time-stamp`,
        label: `Insert interstitial line`,
        keybinding: {
          mode: 'global',
          binding: 'mod+t',
        },
      },
      async () => {
        await insertInterstitional(logseq.settings.defaultTitle ? true : false);
      }
    );

    logseq.App.registerCommandPalette(
      {
        key: `interstial-time-stamp-h`,
        label: `Insert interstitial heading`,
        keybinding: {
          mode: 'global',
          binding: 'mod+shift+t',
        },
      },
      async () => {
        await insertInterstitional(logseq.settings.defaultTitle ? false : true);
      }
    );
}

logseq.ready(main).catch(console.error);
