import {clipboard, Menu, MenuItem} from 'electron';

import platform from 'common/utils/platform';

function create (opt, browserWindow) {
  const webContents = browserWindow.webContents;
  const menu = new Menu();

  if (opt.targetIsEditable && opt.isMisspelling) {
    let hasMisspellingRelatedItems = !!opt.corrections.length;

    for (let i = 0; i < opt.corrections.length && i < 5; i++) {
      menu.append(new MenuItem({
        label: 'Correct: ' + opt.corrections[i],
        click: () => webContents.send('call-webview-method', 'replaceMisspelling', opt.corrections[i])
      }));
    }

    // Hunspell doesn't remember these, so skip this item
    if (!platform.isLinux && !opt.isWindows7) {
      menu.append(new MenuItem({
        label: 'Add to Dictionary',
        click: () => {
          webContents.send('fwd-webview', 'add-selection-to-dictionary');
          webContents.send('call-webview-method', 'replaceMisspelling', opt.selection.trim());
        }
      }));
      hasMisspellingRelatedItems = true;
    }

    if (hasMisspellingRelatedItems) {
      menu.append(new MenuItem({
        type: 'separator'
      }));
    }
  }

  if (opt.hasSelection) {
    // if (process.platform == 'darwin') {
    //   menu.append(new MenuItem({
    //     label: 'Look Up',
    //     click: () => browserWindow.showDefinitionForSelection()
    //   }));
    //
    //   menu.append(new MenuItem({
    //     type: 'separator'
    //   }));
    // }

    menu.append(new MenuItem({
      label: 'Cut',
      enabled: opt.targetIsEditable,
      click: () => webContents.send('call-webview-method', 'cut')
    }));

    menu.append(new MenuItem({
      label: 'Copy',
      click: () => webContents.send('call-webview-method', 'copy')
    }));

    menu.append(new MenuItem({
      type: 'separator'
    }));
  }

  if (opt.targetIsEditable) {
    menu.append(new MenuItem({
      label: 'Paste',
      click: () => webContents.send('call-webview-method', 'pasteAndMatchStyle')
    }));

    menu.append(new MenuItem({
      label: 'Select All',
      click: () => webContents.send('call-webview-method', 'selectAll')
    }));

    menu.append(new MenuItem({
      type: 'separator'
    }));
  }

  if (opt.isTargetLink) {
    menu.append(new MenuItem({
      label: 'Copy Link Address',
      click: () => clipboard.writeText(opt.href)
    }));

    menu.append(new MenuItem({
      label: 'Copy Link Text',
      click: () => webContents.send('call-webview-method', 'copy')
    }));

    menu.append(new MenuItem({
      type: 'separator'
    }));
  }

  if (menu.items.length) {
    return menu;
  }
}

export default {
  create
};
