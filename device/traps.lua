-- SERVER SOCKETS GESTION PENALITE
dofile('./interface/interface.lua');
dofile('./interface/adv.lua');
dofile('./interface/device.lua');

myServer = nil; -- Server de Socket

function Alert(txt, activate)
	app.GetAuiMessage():AddLine(txt, activate);
end

function Success(txt, activate)
	app.GetAuiMessage():AddLineSuccess(txt, activate);
end

function Warning(txt, activate)
	app.GetAuiMessage():AddLineWarning(txt, activate);
end

function Error(txt)
	app.GetAuiMessage():AddLineError(txt);
end

-- Information : Numéro de Version, Nom, Interface
function device.GetInformation()
	return { version = 2.5, name = 'Serveur TRAPS', class = 'network' };
end	

function device.OnConfiguration(node)
	device.address = node:GetAttribute('address');
	if device.address:len() < 2 then
		device.address = app.GetCurrentIPAddress();
	end
	device.port = node:GetAttribute('port');
	if device.port:len() < 2 then
		device.port = 7000;
	end
	
	local dlg = wnd.CreateDialog({
		icon = './res/32x32_chrono.png',
		label = "Configuration Gestion des Pénalités",
		width = 300,
		height = 200
	});
	
	dlg:LoadTemplateXML({ 
		xml = './device/traps.xml',
		node_name = 'root/panel',
		node_attr = 'name', 
		node_value = 'config'
	});
	
	dlg:GetWindowName('address'):SetValue(device.address);
	dlg:GetWindowName('port'):SetValue(device.port);

	-- Toolbar Principale ...
	local tb = dlg:GetWindowName('tb');
	local btnSave = tb:AddTool("Valider", "./res/32x32_ok.png");
	tb:AddStretchableSpace();
	local btnClose = tb:AddTool("Fermer", "./res/vpe32x32_close.png");
	tb:Realize();

	function OnSaveConfig(evt)
		local doc = app.GetXML();
		device.address = dlg:GetWindowName('address'):GetValue();
		device.port = dlg:GetWindowName('port'):GetValue();
		node:ChangeAttribute('address', device.address);
		node:ChangeAttribute('port', device.port);
		doc:SaveFile(app.GetPath()..'/'..app.GetName()..'.xml');
		dlg:EndModal();
	end
	
	dlg:Bind(eventType.MENU, OnSaveConfig, btnSave); 
	
	dlg:Bind(eventType.MENU, function(evt) dlg:EndModal(idButton.CANCEL) end, btnClose);

	dlg:GetWindowName('address'):SetValue(device.address);
	dlg:GetWindowName('port'):SetValue(device.port);

	dlg:Fit();
	dlg:ShowModal();
end

-- Ouverture
function device.OnInit(params, node)
	-- Appel OnInit Metatable
	mt_device.OnInit(params);

	local port = 7012;
	if node ~= nil then
		port = tonumber(node:GetAttribute('port', '7012'));
	end

	local address = node:GetAttribute('address');
	if address:len() < 2 then
		address = app.GetCurrentIPAddress();
	end
	
	-- Creation du Server de Socket "TRAPS"
	local mainFrame = app.GetAuiFrame();
	
	myServer = socketServer.Open(mainFrame, address, port);
	mainFrame:Bind(eventType.SOCKET, OnSockServer, myServer:GetId());
	Success("TRAPS: demarrage serveur "..address..':'..port, true);
end

-- Fermeture
function device.OnClose()
	if myServer ~= nil then
		myServer:Close();
	end

	-- Appel OnClose Metatable
	mt_device.OnClose();
end

function OnSockServer(evt)
	local sockEvent = evt:GetSocketEvent();
	
	if sockEvent == socketNotify.CONNECTION then
		-- CONNECTION
		local sockNew = myServer:Accept();
		if sockNew ~= nil then
			if myServer:AddClient(sockNew) then
				local tPeer = sockNew:GetPeer();
				Alert("TRAPS: ecoute client "..tPeer.ip..':'..tPeer.port);
				return
			end
		end
	elseif sockEvent == socketNotify.LOST then
		-- LOST
		Warning('TRAPS: Client deconnecte');
	elseif sockEvent == socketNotify.INPUT then
		-- INPUT
		myServer:ReadToCircularBuffer(evt:GetSocket());
		local cb = myServer:GetCircularBuffer(evt:GetSocket());
		-- Lecture des Packets 
		while (ReadPacket(cb, evt:GetSocket())) do end
	else
		-- ???
		Error("TRAPS: "..tostring(sockEvent));
	end
end

function ReadPacket(cb)
	local cr = cb:Find(asciiCode.CR);	-- Recherche CR = caractère fin de Trame
	if cr == -1 then return false end 	-- On peut stopper la recherche

	local rawBytes = cb:ReadByte(cr);
	local line = adv.PacketString(rawBytes, 1, cr)
	local tab = string.Split(line,' ')
	if #tab >= 5 and tab[1]=="penalty" then
		local bib = tonumber(tab[2])
		local gate = tonumber(tab[3])
		local boat = tonumber(tab[4])
		local penalty = tonumber(tab[5])
		Alert("TRAPS: dossard "..bib.." porte "..gate.." penalite "..penalty)
		AddPenalty(bib, gate, boat, penalty);
	elseif #tab >= 3 and tab[1]=="chrono" then
		local bib = tonumber(tab[2])
		local chrono = tonumber(tab[3])
		Alert("TRAPS: Net : dossard "..bib.." chrono "..chrono)
		AddTime(bib, chrono)
	elseif #tab >= 3 and tab[1]=="start" then
		local bib = tonumber(tab[2])
		local chrono = tonumber(tab[3])
		Alert("TRAPS: Start : dossard "..bib.." start "..chrono)
		AddTimePassage(bib, chrono, 0)	
	elseif #tab >= 3 and tab[1]=="finish" then
		local bib = tonumber(tab[2])
		local chrono = tonumber(tab[3])
		Alert("TRAPS: Finish : dossard "..bib.." finish "..chrono)
		AddTimePassage(bib, chrono, -1)	
	else
		Warning("Commande inconnue: "..line)
	end	
	return true;	-- il faut poursuivre la recherche	
end

function AddPenalty(bib, gate, embarcation, penalty)
	app.SendNotify('<penalty_add>',
		{ bib = bib, gate = gate, embarcation = embarcation, penalty = penalty  }
	);
end

function AddTime(bib, chrono)
	app.SendNotify("<bib_time>", 
		{ time_chrono = chrono,  passage = -1, bib = bib }
	);
end

function AddTimePassage(bib, chrono, passage)
	app.SendNotify("<passage_add>", 
		{ time_chrono = chrono, passage = passage, bib = bib, device = 'TRAPS' }
	);
end
