import '@logseq/libs';
import SettingSchemaDesc from '@logseq/libs/dist/LSPlugin.user';
// import axios from "axios";

const pluginName  = ["logseq-interstitial", "Logseq Interstitial"]
const markupChoices = ["markdown", "orgmode"]
const markupHeadMrk = ["#", "*"]
const markupTimeMrk = ["**", "*"]
const settingsTemplate:SettingSchemaDesc[] = [{
    key: "defaultTitle",
    type: 'boolean',
    default: false,
    title: "Insert Header by default?",
    description: "If true, \"<mod> t\" will insert a header, otherwise only the (bold) timestamp.",
   },
   {
    key: "boldText",
    type: 'boolean',
    default: true,
    title: "Create a bold timestamp? (If not a header)",
    description: "Insert a bold timestamp. Not for header or custom text.",
  },
  {
    key: "markup",
    type: 'enum',
    enumChoices: markupChoices,
    enumPicker: 'radio',
    default: markupChoices[0],
    title: "What markup language to use?",
    description: "Markdown or Org-mode.",
 },
 {
    key: "level",
    type: 'number',
    default: 3,
    title: "Title level?",
    description: "Insert timestamped heading level, default to 3 (### HH:MM title)",
 },
 {
  key: "cstTime",
  type: 'string',
  default: "",
  title: "Custom time stamp?",
  description: "Leave empty for default, \n Use '<time>' as placeholder.\nExample: '[<time>]'",
},
{
  key: "padHour",
  type: 'boolean',
  default: true,
  title: "Pad hour with zeros?",
  description: "If true it will print: 08:24 (default), otherwise 8:24",
},
{ //KeyboardShortcut-l -> interstial-time-stamp-l !!!!
  key: "KeyboardShortcut_l",
  type: "string",
  title: "Keyboard Shortcut",
  description: "Enter your desired keyboard shortcut for the command",
  default: "mod+t"
},
{ 
  key: "KeyboardShortcut_h",
  type: "string",
  title: "Keyboard Shortcut 2",
  description: "Enter your desired keyboard shortcut for the command",
  default: "mod+shift+t"
}
]
async function updateBlock(block,insertHeader) {
  // true = header - false = timestamp  
  //prefixB
  let prefix  = markupHeadMrk[markupChoices.indexOf(logseq.settings.markup)].repeat(logseq.settings.level)
  const prefixB = (insertHeader) ? prefix : ""

  //timeB
  const today = new Date();
  const time = String(today.getHours()).padStart((logseq.settings.padHour) ? 2 : 1, '0') + 
                ":" + 
                String(today.getMinutes()).padStart(2, '0')
  // Don't bold time if header of if logseq.settings.boldText=false
  const timePrefix = (insertHeader || ! logseq.settings.boldText) ? "" : markupTimeMrk[markupChoices.indexOf(logseq.settings.markup)]
  const timeHolder = (logseq.settings.cstTime) 
      ? logseq.settings.cstTime
      : timePrefix + "<time>" + timePrefix
  const reTime = new RegExp("<time>")
  const timeB = timeHolder.replace(reTime, time)

  //contentB
  prefix = prefix.replace(/\*/g,"\\*") //fix regex
  const re = new RegExp(`^${(prefix === "*" ) ? "\*" : prefix}{1,6}\s+`)
  let contentB = re.test(block.content)
      ? block.content.replace(re, '')
      : block.content;

  // const mdHeader = "#".repeat(logseq.settings.level)

  // const linePrefix = (logseq.settings.markup) 
  //     ? markupHeadMrk[logseq.settings.markup] 
  //     : logseq.settings.cstPrefix


  // const timePrefix = (logseq.settings.markup) ?  markupTimeMrk[logseq.settings.markup] : false
  // let timestamp = (logseq.settings.defaultTitle) ? " <time> " : timePrefix + "<time>" + timePrefix + " "
  // const re2 = 
  
  // let prefix = simple ? linePrefix.repeat(logseq.settings.level) : ''

  await logseq.Editor.updateBlock(
          block.uuid,
          `${prefixB} ${timeB} ${contentB} `
          );
}

async function insertInterstitional(simple) {
  // true = header - false = timestamp
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

function journalDate() {
  //hardcoded yesterday
  let date = (function(d){ d.setDate(d.getDate()-1); return d})(new Date)
  return parseInt(`${date.getFullYear()}${("0" + (date.getMonth()+1)).slice(-2)}${("0" + date.getDate()).slice(-2)}`,10)
}

async function parseQuery(randomQuery,queryTag){
  // https://stackoverflow.com/questions/19156148/i-want-to-remove-double-quotes-from-a-string
  let query = `[:find (pull ?b [*])
  :where
  [?b :block/path-refs [:block/name "${queryTag.toLowerCase().trim().replace(/^["'](.+(?=["']$))["']$/, '$1')}"]]]`
  if ( randomQuery == "yesterday" ) {
    query = `[:find (pull ?b [*])
    :where
    [?b :block/path-refs [:block/name "${queryTag.toLowerCase().trim().replace(/^["'](.+(?=["']$))["']$/, '$1')}"]]
    [?b :block/page ?p]
    [?p :block/journal? true]
    [?p :block/journal-day ${journalDate()}]]`
  }
  try { 
    let results = await logseq.DB.datascriptQuery(query) 
    //Let this be, it won't hurt even if there's only one hit
    let flattenedResults = results.map((mappedQuery) => ({
      uuid: mappedQuery[0].uuid,
    }))
    let index = Math.floor(Math.random()*flattenedResults.length)
    const origBlock = await logseq.Editor.getBlock(flattenedResults[index].uuid, {
      includeChildren: true,
    });
    // return `((${flattenedResults[index].uuid}))`
    return flattenedResults[index].uuid
  } catch (error) {return false}
}

async function onTemplate(uuid){
  //is block(uuid) on a template?
  //returns boolean
  try {
    const block = await logseq.Editor.getBlock(uuid, {includeChildren: false})
    const checkTPL = (block.properties && block.properties.template != undefined) ? true : false
    const checkPRT = (block.parent != null && block.parent.id !== block.page.id)  ? true : false

    if (checkTPL === false && checkPRT === false) return false
    if (checkTPL === true )                       return true 
    return await onTemplate(block.parent.id) 

  } catch (error) { console.log(error) }
}

const main = async () => {
  console.log(`Plugin: ${pluginName[1]} loaded`)
  logseq.useSettingsSchema(settingsTemplate)

  logseq.Editor.registerSlashCommand('Interstitial: Create Random Quote', async () => {
    await logseq.Editor.insertAtEditingCursor(`{{renderer :interstitial, random, quote}} `);
  });

  logseq.Editor.registerSlashCommand('Interstitial: Create Note to Self', async () => {
    await logseq.Editor.insertAtEditingCursor(`{{renderer :interstitial, yesterday, ntnds}} `);
  });

  logseq.App.onMacroRendererSlotted(async ({ slot, payload }) => {
    try {
      var [type, randomQ , tagQ ] = payload.arguments
      if (type !== ':interstitial') return

      //is the block on a template?
      const templYN = await onTemplate(payload.uuid)        
      const uuid = await parseQuery( randomQ, tagQ)
      // parseQuery returns false if no uuid can be found
      const msg = uuid ? `<span style="color: green">{{renderer ${payload.arguments} }}</span> (will run with template)` : `<span style="color: red">{{renderer ${payload.arguments} }}</span> (wrong tag?)`

      if (templYN === true || uuid === false) { 
          await logseq.provideUI({
          key: "interstitial",
          slot,
          template: `${msg}`,
          reset: true,
          style: { flex: 1 },
        })
        return 
      }
      else { 
        const nblock = await logseq.Editor.getBlock(uuid);
        if (!nblock.properties?.id) { logseq.Editor.upsertBlockProperty(nblock.uuid, "id", nblock.uuid); }
        await logseq.Editor.updateBlock(payload.uuid, `((${uuid}))`) 
      }  
    } catch (error) { console.log(error) }
  })

  const registerKeyTitle = () => logseq.App.registerCommandPalette(
      {
        key: `interstial-time-stamp_l`,
        label: `Insert interstitial line`,
        keybinding: {
          mode: 'global',
          binding: logseq.settings.KeyboardShortcut_l.toLowerCase()
        },
      },
      async () => {
        // true = header - false = timestamp
        await insertInterstitional(logseq.settings.defaultTitle ? true : false);
      }
    );

    const registerKeyHeading = () => logseq.App.registerCommandPalette(
      {
        key: `interstial-time-stamp_h`,
        label: `Insert interstitial heading`,
        keybinding: {
          mode: 'global',
          binding: logseq.settings.KeyboardShortcut_h.toLowerCase()
        },
      },
      async () => {
        // true = header - false = timestamp
        await insertInterstitional(logseq.settings.defaultTitle ? false : true);
      }
    );
    
    function unreg(setKey) {
      //unregister keybindings
      const re:RegExp=/^KeyboardShortcut(.*)/
      if (re.test(setKey.key)) {
        const key=re.exec(setKey.key)
        // console.log("DB2", `interstial-time-stamp${key[1]}`)
        logseq.App.unregister_plugin_simple_command(`${logseq.baseInfo.id}/interstial-time-stamp${key[1]}`) 
      }
    }

    logseq.onSettingsChanged((_updated) => {
      settingsTemplate.forEach((x, i) => unreg(x))
      registerKeyHeading()
      registerKeyTitle()
    }); 
}

logseq.ready(main).catch(console.error);
