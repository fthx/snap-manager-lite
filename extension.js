/*	Snap Manager Lite
    Unofficial snap manager for usual snap tasks
    GNOME Shell extension
    GitHub contributors: fthx */


import Clutter from 'gi://Clutter';
import GObject from 'gi://GObject';
import St from 'gi://St';

import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import * as PanelMenu from 'resource:///org/gnome/shell/ui/panelMenu.js';
import * as PopupMenu from 'resource:///org/gnome/shell/ui/popupMenu.js';
import * as Util from 'resource:///org/gnome/shell/misc/util.js';


var SnapMenu = GObject.registerClass(
class SnapMenu extends PanelMenu.Button {
    _init() {
        super._init(0.5, 'Snap manager');

        //let icon = new St.Icon({icon_name: 'snap-symbolic', style_class: 'system-status-icon'});
        //this.add_actor(icon);
        let label = new St.Label({text: 'Snaps', y_expand: true, y_align: Clutter.ActorAlign.CENTER});
        this.add_actor(label);

        // here you can add/remove/hack the actions
        let menuActions =	[
            ["List installed snaps", "echo List installed snaps; echo; snap list"],
            ["List recent snap changes", "echo List recent snap changes; echo; snap changes"],
            ["List available snap refresh", "echo List available snap refresh; echo; snap refresh --list"],
            ["Refresh installed snaps", "echo Refresh installed snaps; echo; snap refresh"],
            ["Install snap...", "echo Install snap...; echo; read -p 'Enter snap name: ' snapname; echo; echo Available channels:; snap info $snapname | awk '/channels:/{y=1;next}y'; echo; read -p 'Enter channel (void=default): ' snapchannel; echo; snap install $snapname --channel=$snapchannel"],
            ["Remove snap...", "echo Remove snap...; echo; snap list; echo; read -p 'Enter snap name: ' snapname; echo; snap remove $snapname"]
        ];

        // here you can add/remove/hack the snap options
        let menuSnapOptions = [
            ["Snap info...", "echo Snap info...; echo; read -p 'Enter snap name: ' snapname; echo; snap info --verbose $snapname"],
            ["Refresh snap channel...", "echo Refresh snap channel...; echo; snap list; echo; read -p 'Enter snap name: ' snapname; echo; echo Available channels:; snap info $snapname | awk '/channels:/{y=1;next}y'; echo; read -p 'Enter new channel: ' snapchannel; echo; snap refresh $snapname --channel=$snapchannel"],
            ["Revert snap refresh...", "echo Revert snap refresh...; echo; snap list; echo; read -p 'Enter snap name: ' snapname; echo; snap revert $snapname"],
            ["Enable snap...", "echo Enable snap...; echo; snap list; echo; read -p 'Enter snap name: ' snapname; echo; snap enable $snapname"],
            ["Disable snap...", "echo Disable snap...; echo; snap list; echo; read -p 'Enter snap name: ' snapname; echo; snap disable $snapname"]
        ];

        // here you can add/remove/hack the snap connections
        let menuSnapConnections = [
            ["List available interfaces", "echo List available interfaces; echo; snap interface"],
            ["List snap connections...", "echo List snap connections...; echo; snap list; echo; read -p 'Enter snap name: ' snapname; echo; echo Available connections:; snap connections $snapname"],
            ["Connect snap...", "echo Connect snap...; echo; snap list; echo; read -p 'Enter snap name: ' snapname; echo; echo Available connections:; snap connections $snapname; echo; read -p 'Enter interface to connect: ' snapconnection; echo; snap connect $snapname:$snapconnection"],
            ["Disconnect snap...", "echo Disconnect snap...; echo; snap list; echo; read -p 'Enter snap name: ' snapname; echo; echo Available connections:; snap connections $snapname; echo; read -p 'Enter interface to disconnect: ' snapconnection; echo; snap disconnect $snapname:$snapconnection"]
        ];

        // here you can add/remove/hack the hold refresh time options
        let menuRefreshOptions = [
            ["Refresh schedule", "echo Refresh schedule; echo; snap refresh --time"],
            ["Hold auto refresh for one hour", "echo Hold auto refresh for one hour; echo; snap refresh --hold=1h"],
            ["Hold auto refresh for one day", "echo Hold auto refresh for one day; echo; snap refresh --hold=24h"],
            ["Hold auto refresh for one week", "echo Hold auto refresh for one week; echo; snap refresh --hold=168h"],
            ["Hold auto refresh forever", "echo Hold auto refresh forever; echo; snap refresh --hold"],
            ["Unhold auto refresh", "echo Unhold auto refresh; echo; snap refresh --unhold"]
        ];

        menuActions.forEach(this._addSnapMenuItem.bind(this));

        // snap configuration submenu
        this.menu.addMenuItem(new PopupMenu.PopupSeparatorMenuItem());
        this.submenu1 = new PopupMenu.PopupSubMenuMenuItem('Snap options');
        this.menu.addMenuItem(this.submenu1);
        menuSnapOptions.forEach(this._addOptionsSubmenuItem.bind(this));

        // snap connections submenu
        this.submenu2 = new PopupMenu.PopupSubMenuMenuItem('Snap connections');
        this.menu.addMenuItem(this.submenu2);
        menuSnapConnections.forEach(this._addConnectSubmenuItem.bind(this));

        // refresh options submenu
        this.submenu3 = new PopupMenu.PopupSubMenuMenuItem('Refresh options');
        this.menu.addMenuItem(this.submenu3);
        menuRefreshOptions.forEach(this._addRefreshSubmenuItem.bind(this));

        // open Snap Store in default browser
        this.menu.addMenuItem(new PopupMenu.PopupSeparatorMenuItem());
        this.menu.addAction("Open Snap Store website", _ => {
            Util.trySpawnCommandLine("xdg-open https://snapcraft.io/store")
        });
    }

    // launch bash command
    _executeAction(command) {
        try {
                Util.trySpawnCommandLine("gnome-terminal -x bash -c \"echo Press Ctrl-C to cancel action.; echo; " + command + "; echo; echo --; read -n 1 -s -r -p 'Press any key to close...'\"")
            } catch(err) {
                Main.notify("Error: unable to execute command in GNOME Terminal")
        }
    }

    // main menu items
    _addSnapMenuItem(item, index, array) {
        if (index == 3) {
            this.menu.addMenuItem(new PopupMenu.PopupSeparatorMenuItem())
        }
        this.menu.addAction(item[0],_ => {
            this._executeAction(item[1])
        });
    }

    // snap options submenu items
    _addOptionsSubmenuItem(item, index, array) {
        this.submenu1.menu.addAction(item[0], _ => {
            this._executeAction(item[1])
        });
    }

    // snap connections submenu items
    _addConnectSubmenuItem(item, index, array) {
        this.submenu2.menu.addAction(item[0], _ => {
            this._executeAction(item[1])
        });
    }

    // refresh options submenu items
    _addRefreshSubmenuItem(item, index, array) {
        this.submenu3.menu.addAction(item[0], _ => {
            this._executeAction(item[1])
        });
    }
});

export default class SnapManagerLiteExtension {
    enable() {
        this._snap_indicator = new SnapMenu();
        Main.panel.addToStatusArea('snap-menu', this._snap_indicator);
    }

    disable() {
        this._snap_indicator.destroy();
        this._snap_indicator = null;
    }
}
