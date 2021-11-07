var HackeLobby = {
    Register: function () { $.Msg("If you see this redownload the lua! https://aimware.net/forum/thread/149882") },
    OnUnload: function () { $.Msg("If you see this redownload the lua! https://aimware.net/forum/thread/149882") }
}
var ServerIp = "http://lobbies.epictrolled.shop" || "http://localhost:3000"
var dev = false

var Lobbies = {
    Buttons: {
        Register: `
    <root>
        <styles>
            <include src="file://{resources}/styles/csgostyles.css" />
            <include src="file://{resources}/styles/advertising_toggle.css" />
        </styles>
    
        <Panel class="btn_advertising" >
            <Panel id="AimwareSearchWrapper" class="full-width vertical-center">
                <Button id="AimwareSearch" class="" onactivate="" style="horizontal-align: center;vertical-align: center;">
                    <Image clampfractionalpixelpositions="false" texturewidth="48" textureheight="48" src="https://i.imgur.com/smnaeRh.png" />
                </Button>
            </Panel>
        </Panel>
    </root>`,
        GetPlayers: `
    <RadioButton id="JsFriendsList-lobbies-toolbar-button-aimware"
			group="JsFriendsList-lobbies-toolbar-button-modegroup"
			class="IconButton friendslist-navbar-lobby-button aimware-lobbies" onactivate="friendsList.SetLobbiesTabListFilters( 'fsdf' );"
			onmouseover="UiToolkitAPI.ShowTextTooltip('JsFriendsList-lobbies-toolbar-button-aimware', 'Aimware lobbies');"
			onmouseout="UiToolkitAPI.HideTextTooltip();">
	    <Image src="https://i.imgur.com/smnaeRh.png"/>
    </RadioButton>`,
        FriendTile: `
        <root>
        <styles>
            <include src="file://{resources}/styles/csgostyles.css" />
            <include src="file://{resources}/styles/friendtile.css" />
            <include src="file://{resources}/styles/friendlobby.css" />
        </styles>
        <scripts>
                                                                                    
        </scripts>
    
        <Panel class="friendtile friendtile-advertise hidden" acceptsfocus="true" mousetracking="true">
            <Panel id="JsFriendTileBtn" class="friendtile-contents">
                <Panel class="full-width full-height left-right-flow">
                    <Panel class="friendtile-avatar-invite-container">
                        <Panel class="friendtile-avatar">
                            <Panel id="JsFriendStatusBar" class="friendtile-avatar__status"/>
                            <Button id="JsFriendAvatarBtn">
                                <CSGOAvatarImage id="JsFriendAvatar" class="friendlobby-avatar__Image friendlobby-avatar__Image--Slots"/>
                            </Button>
                        </Panel>
                        <Panel class="top-bottom-flow vertical-center">
                            <Image id="JsFriendInvited" class="friendtile-status-icon hidden" src="file://{images}/icons/ui/invite.svg" scaling="stretch-to-fit-preserve-aspect" />
                        </Panel>
                    </Panel>
                    <Panel class="friendtile__status" >
                        <Label id="JsFriendName" class="friendtile__text__title" text="#tooltip_lobby_leader_name"/>
                        <Panel class="friendtile__status__advert-advert-row">
                            <Image id="JsFriendAdvertisePrime"
                                    class="friendlobby__row__icon-prime"
                                    src="file://{images}/icons/ui/prime.svg"
                                    texturewidth="20"
                                    textureheight="20"/>
                            <Image id="JsFriendAdvertiseSkillGroup"
                                    class="friendlobby__row__icon-skillgroup" 
                                    textureheight="20"
                                    texturewidth="-1"
                                    defaultsrc="" />
                            <Label id="JsRegionLabel" class="" text=""/>
                        </Panel>
                    </Panel>
                </Panel>
    
                <Button id="JsInviteAdvertisingPlayer" 
                        class="IconButton horizontal-align-right vertical-center">
                    <Image src="file://{images}/icons/ui/invite.svg"
                            texturewidth="32"
                            textureheight="-1"/>
                </Button>
            </Panel>
        </Panel>
    </root>`
    },
    Register: null,
    GetPlayers: null,
    Load: function () {
        let panel = $.GetContextPanel()
        let bar = panel.FindChildTraverse("JsMainMenuNavBar")

        this.Register = $.CreatePanel("Panel", bar, "AimwareSearchPanel")
        this.Register.LoadLayoutFromStringAsync(this.Buttons.Register, false, false)
        this.Register.GetChild(0).GetChild(0).SetPanelEvent("onactivate", () => this.RegisterButton.OnClick())
        bar.MoveChildAfter(this.Register, bar.FindChildTraverse("HireAdvertisingToggleContainer").GetParent())

        let lobbies = panel.FindChildTraverse("JsFriendsList-lobbies").GetChild(0).GetChild(0)
        this.GetPlayers = $.CreatePanel("Panel", lobbies, "AimwareGetPlayersButton")
        this.GetPlayers.BCreateChildren(this.Buttons.GetPlayers)
        this.GetPlayers.GetChild(0).SetPanelEvent("onactivate", () => Lobbies.LoadButton.ShowOptions())
        lobbies.MoveChildAfter(this.GetPlayers, lobbies.FindChildTraverse("JsFriendsList-lobbies-toolbar-button-cooperative"))

    },

    Unload: function () {
        if (this.Register) this.Register.DeleteAsync(1)
        if (this.GetPlayers) this.GetPlayers.DeleteAsync(1)
    },

    PrintChildren: function (obj, depth) {
        $.Msg("--------------------------")
        this._PrintChildren(obj, depth)
        $.Msg("--------------------------")
    },
    _PrintChildren: function (obj, depth) {
        if (!depth) depth = 0
        if (obj && obj.GetChildCount)
            for (let i = 0; i < obj.GetChildCount(); i++) {
                let str = obj.GetChild(i).id + " - " + obj.GetChild(i).paneltype
                //if (str == "PartyList" || str == "JsLocalPlayercard" || str == "AntiAddiction" || str == "JsIncomingInvites") continue
                for (let j = 0; j < depth; j++) str = "    " + str
                $.Msg(str)
                this._PrintChildren(obj.GetChild(i), depth + 1)
            }
    },

    RegisterButton: {
        ServerIp: ServerIp,
        Active: -1,
        Token: null,
        Modes: ["Rage", "Semi-Rage", "Legit"],
        SendRegister: function () {
            if (this.Active == -1) return
            $.AsyncWebRequest(this.ServerIp + "/register", {
                type: 'POST',
                data: {
                    steamId: MyPersonaAPI.GetXuid(),
                    name: MyPersonaAPI.GetName(),
                    rank: MyPersonaAPI.GetCompetitiveRank(),
                    prime: PartyListAPI.GetFriendPrimeEligible(MyPersonaAPI.GetXuid()),
                    flag: MyPersonaAPI.GetMyCountryCode(),
                    mode: this.Modes[this.Active]
                }, complete: (res, err) => {
                    if (err !== "success") {
                        $.Msg("Error: " + err)
                        $.Msg(res)
                    }
                    this.Token = (JSON.parse(res.responseText.slice(0,-1)).token)
                }
            })
        },
        SendUnregister: function () {
            $.AsyncWebRequest(this.ServerIp + "/unregister", {
                type: 'POST',
                data: {
                    token: this.Token
                }, complete: (res, err) => {
                    if (err !== "success") {
                        $.Msg("Error: " + err)
                        $.Msg(res)
                    }
                }
            })
        },
        OnClick: function () {
            let ref = this
            var callbackFunction = function (mode) {
                ref.Active = mode
                if (mode !== -1)
                    ref.SendRegister()
                else ref.SendUnregister()
                $.DispatchEvent('PlaySoundEffect', 'UIPanorama.generic_button_press', 'MOUSE')
            }

            var items = []
            for (let i = 0; i < this.Modes.length; i++) {
                const el = this.Modes[i]
                var labelLoc = i === this.Active ?
                    `<b><font color='#2aa32e'> <img src="https://i.imgur.com/smnaeRh.png"> Looking for ${el}</b></font>` :
                    `<img src="https://i.imgur.com/smnaeRh.png"> Looking for ${el}`

                items.push({ label: labelLoc, style: 'Icon', jsCallback: callbackFunction.bind(undefined, i) })
            }

            items.push({
                label: $.Localize('#advertising_for_hire_open_friends_list'),
                style: 'TopSeparator',
                jsCallback: function () {
                    $.DispatchEvent('OpenSidebarPanel', true)
                }
            }
            )

            if (this.Active !== -1) {
                items.push({ label: $.Localize('#advertising_for_hire_stop_looking'), style: 'TopSeparator', jsCallback: callbackFunction.bind(undefined, -1) })
            }

            UiToolkitAPI.ShowSimpleContextMenu('', 'ControlLibSimpleContextMenu', items)
        }
    },
    LoadButton: {
        ServerIp: ServerIp,
        Modes: ["Rage", "Semi-Rage", "Legit"],
        Load: function (mode) {
            $.AsyncWebRequest(this.ServerIp + "/load", {
                type: 'POST',
                data: {
                    mode: this.Modes[mode]
                }, complete: (res, err) => {
                    if (err !== "success") {
                        $.Msg("Error: " + err)
                        $.Msg(res)
                    }
                    let playersDisplay = $.GetContextPanel().FindChildTraverse("JsFriendsList-lobbies").FindChildTraverse("JsFriendsList-List")
                    playersDisplay.RemoveAndDeleteChildren()
                    var players = JSON.parse(res.responseText.slice(0, -1))
                    for (let i = 0; i < players.length; i++) {
                        const el = players[i];
                        if (!dev)
                            if (el.steamId == MyPersonaAPI.GetXuid()) continue

                        let player = $.CreatePanel("Panel", playersDisplay, el.steamId)
                        player.BLoadLayoutFromString(Lobbies.Buttons.FriendTile, false, false)
                        player.SetAttributeString("xuid", el.steamId)
                        FriendAdvertiseTile.Init(player, el)
                        player.RemoveClass("hidden")
                    }
                }
            })
        },
        ShowOptions: function () {
            $.Schedule(0.01, () => { $.GetContextPanel().FindChildTraverse("JsMainMenuSidebar").RemoveClass('mainmenu-sidebar--minimized') });

            let ref = this
            var callbackFunction = function (mode) {
                ref.Load(mode)
                $.DispatchEvent('PlaySoundEffect', 'UIPanorama.generic_button_press', 'MOUSE')
            }

            let items = []
            for (let i = 0; i < this.Modes.length; i++) {
                const el = this.Modes[i]
                let labelLoc = `<img src="https://i.imgur.com/smnaeRh.png"> Looking for ${el}`

                items.push({ label: labelLoc, style: 'Icon', jsCallback: callbackFunction.bind(undefined, i) })
            }
            UiToolkitAPI.ShowSimpleContextMenu('', 'ControlLibSimpleContextMenu', items)
        },
    },
}

var FriendAdvertiseTile = (function () {

    var _m_xuid = '';

    var remap_lang_to_region = {
        af: 'za',
        ar: 'sa',
        be: 'by',
        cs: 'cz',
        da: 'dk',
        el: 'gr',
        en: 'gb',
        et: 'ee',
        ga: 'ie',
        he: 'il',
        hi: 'in',
        ja: 'jp',
        kk: 'kz',
        ko: 'kr',
        nn: 'no',
        sl: 'si',
        sr: 'rs',
        sv: 'se',
        uk: 'ua',
        ur: 'pk',
        vi: 'vn',
        zh: 'cn',
        zu: 'za',
    }

    var _Init = function (elTile, data) {
        _SetNameAvatar(elTile, data.name, data.steamId)
        _SetPrime(elTile, data.prime)
        _SetFlag(elTile, data.flag)
        _SetSkillGroup(elTile, data.rank)
        _SetInvitedFromCallback(elTile)
        _ShowInviteButton(elTile)
        _OnInviteSetPanelEvent(elTile)
    }

    var _SetNameAvatar = function (elTile, name, steamId) {
        elTile.SetDialogVariable('friendname', name)
        elTile.FindChildTraverse('JsFriendAvatar').steamid = steamId
        elTile.FindChildTraverse('JsFriendAvatarBtn').SetPanelEvent('onactivate', _OpenContextMenu.bind(undefined, steamId))
    }

    var _SetPrime = function (elTile, prime) {
        elTile.FindChildTraverse('JsFriendAdvertisePrime').visible = prime ? true : false
    }

    var _SetFlag = function (elTile, flag) {
        if (remap_lang_to_region[flag]) {
            flag = remap_lang_to_region[flag].toUpperCase();
        }
        var elLabel = elTile.FindChildTraverse('JsRegionLabel');
        tooltipString = $.LocalizeSafe("#SFUI_Country_" + flag.toUpperCase());
        elLabel.AddClass('visible-if-not-perfectworld');

        elLabel.text = flag.toUpperCase()

        elLabel.style.backgroundImage = 'url("file://{images}/regions/' + flag + '.png")';

        var elTTAnchor = elLabel.FindChildTraverse('region-tt-anchor');
        if (!elTTAnchor) {
            elTTAnchor = $.CreatePanel("Panel", elLabel, elTile.id + '-region-tt-anchor');
        }

        if (tooltipString) {
            elLabel.SetPanelEvent('onmouseover', _ => UiToolkitAPI.ShowTextTooltip(elTTAnchor.id, tooltipString));
            elLabel.SetPanelEvent('onmouseout', _ => UiToolkitAPI.HideTextTooltip());
        }
        elLabel.RemoveClass('hidden');
        elLabel.SetHasClass('world-region-label', true);
        elLabel.SetHasClass('world-region-label--image', true);
    };

    var _SetSkillGroup = function (elTile, rank) {
        var elSkillGroupImg = elTile.FindChildTraverse('JsFriendAdvertiseSkillGroup')

        if (!rank || rank == 0)
            elSkillGroupImg.AddClass('hidden')
        else {
            elSkillGroupImg.RemoveClass('hidden')
            elSkillGroupImg.SetImage('file://{images}/icons/skillgroups/' + "skillgroup" + rank + '.svg')
        }
    };

    var _OpenContextMenu = function (xuid) {

        $.DispatchEvent('SidebarContextMenuActive', true)

        var contextMenuPanel = UiToolkitAPI.ShowCustomLayoutContextMenuParametersDismissEvent(
            '',
            '',
            'file://{resources}/layout/context_menus/context_menu_playercard.xml',
            'xuid=' + xuid +
            '&type=nearby',
            function () {
                $.DispatchEvent('SidebarContextMenuActive', false)
            }
        );
        contextMenuPanel.AddClass("ContextMenu_NoArrow")
    };

    var _ShowInviteButton = function (elTile) {
        var elInvited = elTile.FindChildTraverse('JsInviteAdvertisingPlayer')
        elInvited.visible = true
    };

    var _SetInvitedFromCallback = function (elTile) {
        var isInvited = FriendsListAPI.IsFriendInvited(_m_xuid)
        _SetInvited(elTile, isInvited)
    };

    var _SetInvited = function (elTile, isInvited) {
        var elInvited = elTile.FindChildTraverse('JsFriendInvited')

        if (elInvited !== null)
            elInvited.SetHasClass('hidden', !isInvited)
    };

    var _OnInviteSetPanelEvent = function (elTile) {
        var onActivate = function (xuid) {
            StoreAPI.RecordUIEvent("ActionInviteFriendFrom_nearby")
            FriendsListAPI.ActionInviteFriend(xuid, '')
            $.DispatchEvent('FriendInvitedFromContextMenu', xuid)
        }

        var btn = elTile.FindChildTraverse('JsInviteAdvertisingPlayer')
        btn.SetPanelEvent('onactivate', onActivate.bind(undefined, _m_xuid))
    };

    return {
        Init: _Init,
    };

})();

Lobbies.Load()
