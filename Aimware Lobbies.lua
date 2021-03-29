local lastTime = 0
local function Search() 
	if globals.TickCount() - lastTime > 64 * 30 then
		RunScript([[HackeLobby.Register()]])
		lastTime = globals.TickCount()
	end
end

local function RunScript(script)
	if panorama.RunScript then
		panorama.RunScript(script)
	end
	if panorama.loadstring then
		panorama.loadstring(script, "CSGOMainMenu")()
	end
end

local function Unload()
	RunScript([[HackeLobby.OnUnload()]])
end

local js = http.Get("https://raw.githubusercontent.com/Trollface7272/Aimware-Lobbies/main/panorama.js")
RunScript(js)
callbacks.Register("Unload", Unload)
callbacks.Register("Draw", Search)
