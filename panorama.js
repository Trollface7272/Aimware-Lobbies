var buttonLayout = `
<RadioButton id="JsFriendsList-lobbies-toolbar-button-aimware"
			group="JsFriendsList-lobbies-toolbar-button-modegroup"
			class="IconButton friendslist-navbar-lobby-button aimware-lobbies" onactivate=""
			onmouseover="UiToolkitAPI.ShowTextTooltip('JsFriendsList-lobbies-toolbar-button-aimware', 'Aimware lobbies');"
			onmouseout="UiToolkitAPI.HideTextTooltip();">
	<Image src="https://i.imgur.com/L42LMXU.png"/>
</RadioButton>
`
var friendTile = `
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
						<Image id="JsFriendAdvertiseFlag" 
								class="friendlobby__row__icon-flag" 
								src=""
								defaultsrc=""
								texturewidth="-1" 
								textureheight="20"/>
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
</root>
`
var registerButton = `
<root>
	<styles>
		<include src="file://{resources}/styles/csgostyles.css" />
		<include src="file://{resources}/styles/mainmenu.css" />
	</styles>
	
	<Panel class="horizontal-center aimware-lobbies">
		<RadioButton id="LobbyRegisterButton"
					class="mainmenu-navbar__btn-small"
					onmouseover="UiToolkitAPI.ShowTextTooltip('LobbyRegisterButton','Search for a lobby');"
					onmouseout="UiToolkitAPI.HideTextTooltip();">
				<Image src="https://i.imgur.com/L42LMXU.png" />
		</RadioButton>
	</Panel>
</root>
`
var url = "20.52.136.139:3000"

var DEBUG = true

if (typeof(lobbiesLoaded) != "undefined" || DEBUG) {
var HackeLobby = {
	Registered: false,
    OnLoad: function() {
        this._CreateLobbyButton()
        this._CreateRegisterButton()
	},
	OnUnload: function() {
		$.Msg($.GetContextPanel().FindChildrenWithClassTraverse("aimware-lobbies").length)
		$.GetContextPanel().GetChild(0).FindChildTraverse("JsFriendsList-lobbies").GetChild(0).GetChild(0)
		let arr = $.GetContextPanel().FindChildrenWithClassTraverse("aimware-lobbies")
		for(let i = 0; i < arr.length; i++) {
			$.Msg(arr[i])
			arr[i].DeleteAsync(1)
		}
		HackeLobby = undefined
		lobbiesLoaded = undefined
	},
    _CreateLobbyButton: function() {
        var lobbies = $.GetContextPanel().GetChild(0).FindChildTraverse("JsFriendsList-lobbies")
		var radioButtonPanel = lobbies.GetChild(0).GetChild(0)
		
        radioButtonPanel.BCreateChildren(buttonLayout)

		var aimware = radioButtonPanel.FindChild("JsFriendsList-lobbies-toolbar-button-aimware")
		

        radioButtonPanel.MoveChildAfter(aimware, radioButtonPanel.GetChild(3))
        aimware.ClearPanelEvent("onactivate")
        aimware.SetPanelEvent("onactivate", () => {
            HackeLobby._ClickedLobbies()
        })
    },
    _CreateRegisterButton: function() {
        var menu = $.GetContextPanel().GetChild(0).FindChildTraverse('JsMainMenuNavBar')
        if(!menu) return
        if (menu.FindChild("LobbyRegisterButtonPanel"))
            menu.FindChild("LobbyRegisterButtonPanel").DeleteAsync(1)
            
        var panel = $.CreatePanel("Panel", menu, "LobbyRegisterButtonPanel")
        if(!panel) return

        if(!panel.BLoadLayoutFromString(registerButton, false, false))
            return

        menu.MoveChildAfter(panel, menu.FindChildTraverse("MainMenuNavBarSettings"))

		var button = panel.FindChildTraverse("LobbyRegisterButton")

        button.SetPanelEvent("onactivate", () => {
            this.Registered = !this.Registered
            if (this.Registered)
                this.Register()
            else 
                this.UnRegister()
        })
	},
    UnRegister: function() {
        $.AsyncWebRequest("http://"+url+"/unregister",  { 
            type: 'POST', 
            data: {
                steamId: MyPersonaAPI.GetXuid(),
                name: MyPersonaAPI.GetName(),
                skillGroup: MyPersonaAPI.GetCompetitiveRank(),
                prime: MyPersonaAPI.GetCurrentLevel() > 20 || MyPersonaAPI.HasPrestige(),
                flag: MyPersonaAPI.GetMyCountryCode()
            }, complete: (res, err) => {
                if (err !== "success") {
                    $.Msg("Error: " + err)
                    $.Msg(res)
                }
            }
        })
    },
    Register: function() {
        if (!this.Registered) return
        $.AsyncWebRequest("http://"+url+"/register",  { 
            type: 'POST', 
            data: {
                steamId: MyPersonaAPI.GetXuid(),
                name: MyPersonaAPI.GetName(),
                skillGroup: MyPersonaAPI.GetCompetitiveRank(),
                prime: MyPersonaAPI.GetCurrentLevel() > 20 || MyPersonaAPI.HasPrestige(),
                flag: MyPersonaAPI.GetMyCountryCode()
            }, complete: (res, err) => {
                if (err !== "success") {
                    $.Msg("Error: " + err)
                    $.Msg(res)
                }
            }
        })
    },
    _ClickedLobbies: function() {
        $.AsyncWebRequest("http://"+url+"/load",  { type: 'POST', data: {}, complete: (res, err) => {
            var playersDisplay =  $.GetContextPanel().GetChild(0).FindChildTraverse("JsFriendsList-lobbies").FindChildTraverse("JsFriendsList-List")
            playersDisplay.RemoveAndDeleteChildren()
            if (!res.responseText) return
            var players = []
            for (let i = 0; i < res.responseText.split("\n").length; i++) {
                var data = res.responseText.split("\n")[i].split(":")
                if (data.length !== 5) continue
                players.push({
                    steamId: data[0],
                    name: data[1],
                    skillGroup: data[2],
                    prime: data[3],
                    flag: data[4]
                })
            }


            for (let i = 0; i < players.length; i++) {
                const el = players[i];
                //if (el.steamId == MyPersonaAPI.GetXuid()) continue
                var player = $.CreatePanel("Panel", playersDisplay, el.steamId)
                player.BLoadLayoutFromString(friendTile, false, false)
                player.SetAttributeString("xuid", el.steamId)
                FriendAdvertiseTile.Init(player, el)
                player.RemoveClass("hidden")
            }
        } 
    })
    },
    _ClickedRegister: function() {

    },
    PrintChildren: function(obj, depth) {
        if (obj.GetChildCount)
        for (var i = 0; i < obj.GetChildCount(); i++) {
            var str = obj.GetChild(i).id
            //if (str == "PartyList" || str == "JsLocalPlayercard" || str == "AntiAddiction" || str == "JsIncomingInvites") continue
            for(var j = 0; j < depth; j++) str = "    " + str
            $.Msg(str)
            this.PrintChildren(obj.GetChild(i), depth+1)
        } 
    }
}
var FriendAdvertiseTile = ( function (){

	var _m_xuid = '';

	var _Init = function (elTile, data) {
		_SetNameAvatar(elTile, data.name, data.steamId)
		_SetPrime(elTile, data.prime)
		_SetFlag(elTile, data.flag)
		_SetSkillGroup(elTile, data.skillGroup)
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
		var elFlagImg = elTile.FindChildTraverse('JsFriendAdvertiseFlag')
		if (flag) {
			elFlagImg.SetImage('file://{images}/flags/'+ flag +'.png')
			elFlagImg.RemoveClass('hidden')
		} else {
			elFlagImg.AddClass('hidden')
		}
	};

	var _SetSkillGroup = function (elTile, rank) {
		var elSkillGroupImg = elTile.FindChildTraverse('JsFriendAdvertiseSkillGroup')
		
		if(!rank)
			elSkillGroupImg.AddClass('hidden')
		else {
			elSkillGroupImg.RemoveClass('hidden')
			elSkillGroupImg.SetImage('file://{images}/icons/skillgroups/' + "skillgroup" + rank +'.svg')
		}
	};

	var _OpenContextMenu = function (xuid) {
		                                                                                             
		$.DispatchEvent('SidebarContextMenuActive', true)
		
		var contextMenuPanel = UiToolkitAPI.ShowCustomLayoutContextMenuParametersDismissEvent(
			'',
			'',
			'file://{resources}/layout/context_menus/context_menu_playercard.xml', 
			'xuid='+xuid+
			'&type=nearby',
			function () {
				$.DispatchEvent('SidebarContextMenuActive', false)
			}
		);
		contextMenuPanel.AddClass("ContextMenu_NoArrow")
	};

	var _ShowInviteButton = function(elTile) {
		var elInvited = elTile.FindChildTraverse('JsInviteAdvertisingPlayer')
		elInvited.visible = true
	};

	var _SetInvitedFromCallback = function(elTile) {
		var isInvited = FriendsListAPI.IsFriendInvited(_m_xuid)
		_SetInvited(elTile, isInvited)
	};

	var _SetInvited = function(elTile, isInvited) {
		var elInvited = elTile.FindChildTraverse('JsFriendInvited')

		if (elInvited !== null)
			elInvited.SetHasClass('hidden', !isInvited)
	};

	var _OnInviteSetPanelEvent = function(elTile) {
		var onActivate = function(xuid) {
			StoreAPI.RecordUIEvent("ActionInviteFriendFrom_nearby")
			FriendsListAPI.ActionInviteFriend(xuid, '')
			$.DispatchEvent('FriendInvitedFromContextMenu', xuid)
		}
		
		var btn = elTile.FindChildTraverse('JsInviteAdvertisingPlayer')
		btn.SetPanelEvent('onactivate', onActivate.bind( undefined, _m_xuid))
	};

	return {
		Init: _Init,                       
	};

})();
HackeLobby.OnLoad()
lobbiesLoaded = true
}
