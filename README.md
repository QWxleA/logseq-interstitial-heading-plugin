# Interstitial journaling helper

[![latest release version](https://img.shields.io/github/v/release/QWxleA/logseq-interstitial-heading-plugin)](https://github.com/QWxleA/logseq-interstitial-heading-plugin)
[![License](https://img.shields.io/github/license/QWxleA/logseq-interstitial-heading-plugin?color=blue)](https://github.com/QWxleA/logseq-interstitial-heading-plugin/blob/main/LICENSE)

> Interstitial journaling is a productivity technique created by Tony Stubblebine. To my knowledge, it’s the simplest way to combine note-taking, tasks, and time tracking in one unique workflow. -- [Interstitial journaling: combining notes, to-do & time tracking - Ness Labs](https://nesslabs.com/interstitial-journaling)

![journal](./journal.png)

This plugin makes it *just* a tiny bit easier. Two shortcuts that fill in the time, *and* add the correct markup to make it look nice.

Next, it makes it possible to send a note to yourself (write yesterday, see today), or just add a random note to a template.

## Installation

### Preparation

- Click the 3 dots in the righthand corner and go to Settings.
- Go to **Advanced** and enable **Plug-in system**.
- Restart the application.
- Click 3 dots and go to Plugins (or `Esc t p`).

### Install plugin from the Marketplace (recommended) 

- Click the `Marketplace` button and then click `Plugins`.
- Find the plugin and click Install.

### Install plugin manually

- Download a released version assets from Github.
- Unzip it.
- Click Load unpacked plugin, and select destination directory to the unziped folder.

## Using timestamps

- Use `Ctrl-t` to insert a timestamp in the current block/line.
- Use `Ctrl-Shift-t` to insert a timestamped heading in the current block/line.

In the settings you can reverse this, so the default `Ctrl-t` becomes a timestamped heading.

### Configuration

Under settings you can change the level of the heading, it defaults to 3 (`### HH:MM <optional title>`)

## Templates

The plugin gives to commands to insert a "note to self" or a "random quote".

The idea is to put these in a template, and then, when the template is executed, the result will be a linked block to the not e or quote.

Usage:

type: `/Create Note to Self` or `/Create Random Quote`, and it will insert a code-snippet that will then be run with the template.

The code snippets looks like this `{{renderer :interstitial, yesterday, ntnds}}` `{{renderer :interstitial, random, quote}}`.

The parts you can alter are: `yesterday` or `random`, choose one of the two. Next you can alter `ntnds` and `quote`, you can choose any tag you use in your system. These are just the ones I use 😁.

## Licence

MIT

### Image license

Image from: [flickr](https://www.flickr.com/photos/kotomi-jewelry/33599728252) (the original looks much better) <a rel="license" href="http://creativecommons.org/licenses/by-nc/2.0/"><img alt="Creative Commons License" style="border-width:0" src="https://i.creativecommons.org/l/by-nc/2.0/88x31.png" /></a><br />This image is licensed under a <a rel="license" href="http://creativecommons.org/licenses/by-nc/2.0/">Creative Commons Attribution-NonCommercial 2.0 Generic License</a>.

### Font License

[OFL](./OFL.txt)