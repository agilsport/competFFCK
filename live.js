function OnOpenWebSocketCommand()
{
	wsContext.wsCommand.send(JSON.stringify({key : '<race_load>' }));
}

function OnFlowOnCourse(objJSON) 
{
	const elClock = document.getElementById("clock");
	if (elClock == null)
		return;
	
	elClock.innerHTML = adv.GetChronoHHMMSSCC(objJSON.clock);

	const tOnCourse = adv.GetTableUnique(objJSON, 'table');
	const tOnCoursePrev = wsContext.notify_on_course;
	const tRanking = adv.GetTableUnique(wsContext.notify_ranking, 'ranking')

	if (typeof tOnCoursePrev == 'object')
	{
		// Suppression des anciens on_course tjs ok ...
		for (let i=0;i<tOnCourse.GetNbRows();i++)
		{
			var bib = tOnCourse.GetCell('bib',i);
			for (let k=0;k<tOnCoursePrev.GetNbRows();k++)
			{
				if (tOnCoursePrev.GetCell('bib',k) == bib)
				{
					tOnCoursePrev.RemoveRowAt(k);
					break;
				}
			}
		}
	}
	
	// Traitement des on_course ok ...
	for (let i=0;i<tOnCourse.GetNbRows();i++)
	{
		var bib = tOnCourse.GetCell('bib',i);
		for (let j=0;j<tRanking.GetNbRows();j++)
		{
			if (bib == tRanking.GetCell('Dossard', j))
			{
				const elem = document.querySelectorAll('#main table tbody tr[data-bib="'+bib+'"] td.time');
				if (elem && typeof elem === "object" && elem.length == 1)
				{
					elem[0].innerHTML = tOnCourse.GetCellChrono('time', i, 'HHMMSSCC');
					elem[0].setAttribute('data-oncourse', '1');
				}
				break;
			}
		}
	}
	
	if (typeof tOnCoursePrev == 'object')
	{
		// Remise en état des anciens on_course ko ...
		for (let k=0;k<tOnCoursePrev.GetNbRows();k++)
		{
			var bib = tOnCoursePrev.GetCell('bib',k);
			for (let j=0;j<tRanking.GetNbRows();j++)
			{
				if (bib == tRanking.GetCell('Dossard', j))
				{
					const elem = document.querySelectorAll('#main table tbody tr[data-bib="'+bib+'"]');
					if (elem && typeof elem === "object" && elem.length == 1)
					{
						elem[0].children[5].innerHTML = tRanking.GetCellChrono('Tps'+canoe.GetCodeCoursePhase(), j, 'HHMMSSCC');
						elem[0].children[5].setAttribute('data-oncourse', '0');
					}
					break;
				}
			}
		}
	}

	wsContext.notify_on_course = tOnCourse;
}

function OnBroadcastModeChrono(objJSON)
{
	if (typeof wsContext.notify_ranking !== 'object')
		OpenWebSocketCommand();
}

function OnBroadcastRunErase(objJSON)
{
	if (typeof wsContext.notify_ranking === 'object')
	{
		if (objJSON.Code_competition == canoe.GetCodeCompetition() && objJSON.Code_course == canoe.GetCodeCourse() && objJSON.Code_phase == canoe.GetCodePhase())
		{
			const tOnCourse = wsContext.notify_on_course;
			if (typeof tOnCourse === 'object')
				tOnCourse.RemoveAllRows();
			
			const elem = document.querySelectorAll('#main table tbody tr td[data-oncourse="1"]');
			if (elem && typeof elem === "object" && elem.length >= 1)
			{
				for (let i=0;i<elem.length;i++)
					elem[i].setAttribute('data-oncourse', '0');
			}

			const tRanking = adv.GetTableUnique(wsContext.notify_ranking, 'ranking');
			const course_phase = canoe.GetCodeCoursePhase();
			tRanking.SetColumnToNull('Tps_chrono'+course_phase);
			tRanking.SetColumnToNull('Tps'+course_phase);
			tRanking.SetColumnToNull('Clt'+course_phase);
			tRanking.SetColumnToNull('Cltc'+course_phase);
			
			SetBodyEpreuve();
		}
	}
}

function OnBroadcastBibTime(objJSON) 
{
	if (typeof wsContext.notify_ranking === 'object')
	{
		const passage = parseInt(objJSON.passage);
		if (passage >= 1)
			DoBroadcastBibTimeInter(objJSON, passage);
		else
			DoBroadcastBibTimeFinish(objJSON);
	}
}
	
function DoBroadcastBibTimeFinish(objJSON) 
{
	const bib = objJSON.bib;
	const tRanking = adv.GetTableUnique(wsContext.notify_ranking, 'ranking');
	const course_phase = canoe.GetCodeCoursePhase();
	const codeActivite = canoe.GetCodeActivite();
	
	const tOnCoursePrev = wsContext.notify_on_course;
	for (let k=0;k<tOnCoursePrev.GetNbRows();k++)
	{
		if (tOnCoursePrev.GetCell('bib',k) == bib)
		{
			tOnCoursePrev.RemoveRowAt(k);
			break;
		}
	}
	
	for (let i=0;i<tRanking.GetNbRows();i++)
	{
		if (bib == tRanking.GetCell('Dossard', i))
		{
			if (codeActivite == 'SLA')
			{
				tRanking.SetCell('Tps_chrono'+course_phase,i, objJSON.time_chrono);
				const elemChrono = document.querySelectorAll('#main table tbody tr[data-bib="'+bib+'"] td.chrono');
				if (elemChrono && typeof elemChrono === "object" && elemChrono.length == 1)
					elemChrono[0].innerHTML = adv.GetChronoHHMMSSCC(objJSON.time_chrono);
				
				UpdateSlalomFinishTime(tRanking, i);

				const elemTime = document.querySelector('#main table tbody tr[data-bib="'+bib+'"] td.time');
				if (elemTime && typeof elemTime === "object")
				{
					elemTime.setAttribute('data-oncourse', '2');

					window.setTimeout(function() { 
						elemTime.setAttribute('data-oncourse', '3');
						window.setTimeout(function() { elemTime.setAttribute('data-oncourse', '0') }, 3000);
						} , 1000
					);
				}
			}
			else
			{
				// Descente ...
				tRanking.UpdateRankingTime(i, tRanking.GetIndexColumn('Tps'+course_phase), tRanking.GetIndexColumn('Cltc'+course_phase), tRanking.GetCellInt('Tps'+course_phase,i), objJSON.time_chrono);
				const elemTime = document.querySelector('#main table tbody tr[data-bib="'+bib+'"] td.time');
				if (elemTime && typeof elemTime === "object")
				{
					const time_chrono = adv.GetChronoHHMMSSCC(objJSON.time_chrono);
					if (objJSON.diff_categ === undefined)
					{
						elemTime.innerHTML = time_chrono;
						elemTime.setAttribute('data-oncourse', '2');
					}
					else
					{
						elemTime.innerHTML = time_chrono+'['+adv.GetChronoDiffMMSSCC(objJSON.diff_categ)+']';
						if (objJSON.diff_categ > 0)
							elemTime.setAttribute('data-oncourse', 'red');
						else
							elemTime.setAttribute('data-oncourse', 'green');
					}

					window.setTimeout(function() { 
						elemTime.setAttribute('data-oncourse', '3');
						window.setTimeout(function() { elemTime.innerHTML = time_chrono; elemTime.setAttribute('data-oncourse', '0') }, 10000);
						} , 5000
					);
				}
				
				// Ré-Affichage Colonne Cltc
				for (let k=0;k<tRanking.GetNbRows();k++)
				{
					const elemRank = document.querySelector('#main table tbody tr[data-bib="'+tRanking.GetCell('Dossard',k)+'"] td.rank');
					if (elemRank && typeof elemRank === "object")
					{
						elemRank.innerHTML = tRanking.GetCellRank('Cltc'+course_phase, k);
					}
				}
			}
			break;
		}
	}
}

function DoBroadcastBibTimeInter(objJSON, inter) 
{
	const bib = objJSON.bib;
	const tRanking = adv.GetTableUnique(wsContext.notify_ranking, 'ranking');
	const course_phase_inter = canoe.GetCodeCoursePhase()+'_inter'+inter;
		
	for (let i=0;i<tRanking.GetNbRows();i++)
	{
		if (bib == tRanking.GetCell('Dossard', i))
		{
			tRanking.UpdateRankingTime(i, tRanking.GetIndexColumn('Tps'+course_phase_inter), tRanking.GetIndexColumn('Cltc'+course_phase_inter), tRanking.GetCellInt('Tps'+course_phase_inter,i), objJSON.time_chrono);

			const elemTime = document.querySelector('#main table tbody tr[data-bib="'+bib+'"] td.time_inter[data-inter="'+inter+'"]');
			if (elemTime && typeof elemTime === "object")
			{
				if (objJSON.diff_categ === undefined)
				{
					elemTime.innerHTML = adv.GetChronoHHMMSSCC(objJSON.time_chrono);
				}
				else
				{
					const time_inter = adv.GetChronoHHMMSSCC(objJSON.time_chrono);
					elemTime.innerHTML = time_inter+'['+adv.GetChronoDiffMMSSCC(objJSON.diff_categ)+']';

					if (objJSON.diff_categ > 0)
						elemTime.setAttribute('data-oncourse', 'red');
					else
						elemTime.setAttribute('data-oncourse', 'green');

					window.setTimeout(function() { 
						elemTime.setAttribute('data-oncourse', 'end');
						window.setTimeout(function() { elemTime.innerHTML = time_inter; elemTime.setAttribute('data-oncourse', '0') }, 3000);
						} , 4000
					);
				}
			}
			
			for (let k=0;k<tRanking.GetNbRows();k++)
			{
				const elemRank = document.querySelector('#main table tbody tr[data-bib="'+tRanking.GetCell('Dossard',k)+'"] td.rank_inter[data-inter="'+inter+'"');
				if (elemRank && typeof elemRank === "object")
				{
					elemRank.innerHTML = tRanking.GetCellRank('Cltc'+course_phase_inter, k);
				}
			}
			
			break;
		}
	}	
}

function OnBroadcastPenaltyAdd(objJSON) 
{
	const bib = objJSON.bib;
	SetOnCoursePenalty(bib, objJSON.gate, objJSON.penalty);

	const tRanking = adv.GetTableUnique(wsContext.notify_ranking, 'ranking');
	for (let i=0;i<tRanking.GetNbRows();i++)
	{
		if (bib == tRanking.GetCell('Dossard', i))
		{
			tRanking.SetCell('@PENA_'+objJSON.gate+'_1', i, objJSON.penalty);
			UpdateSlalomFinishTime(tRanking, i);
			break;
		}
	}
}

function SetOnCoursePenalty(bib, gate, pena)
{
	const elem = document.querySelectorAll('#onCourse tr[data-bib="'+bib.toString()+'"] td[data-col="'+gate.toString()+'"]');
	if (elem && typeof elem === "object" && elem.length == 1)
	{
		if (pena == '0')
		{
			elem[0].setAttribute("data-pen", '0');
			elem[0].innerHTML = '';
		}
		else if (pena == '2')
		{
			elem[0].setAttribute("data-pen", '2');
			elem[0].innerHTML = '2';
		}
		else if (pena == '50')
		{
			elem[0].setAttribute("data-pen", '50');
			elem[0].innerHTML = '50';
		}
		else
		{
			elem[0].setAttribute("data-pen", '-1');
			elem[0].innerHTML = '';
		}
	}
}

function UpdateSlalomFinishTime(tRanking, row)
{
	const course_phase = canoe.GetCodeCoursePhase();
	const nbPorte = wsContext.notify_ranking.Nb_porte;
	const bib = tRanking.GetCell('Dossard', row);

	var sumPena = 0;
	for (let p = 1; p <= nbPorte; p++)
	{
		var pen = tRanking.GetCell('@PENA_'+p.toString()+'_1', row);
		if (pen == '2')
			sumPena += 2;
		else if (pen == '50')
			sumPena += 50;
		else if (pen != '0')
		{
			sumPena = -1;
			break;
		}
	}
	
	var newTps = adv.chrono.KO;
	if (sumPena >= 0)
	{
		var tpsChrono = tRanking.GetCellInt('Tps_chrono'+course_phase, row);
		if (tpsChrono >= adv.chrono.OK)
			newTps = tpsChrono + sumPena * 1000;
		else
			newTps = tpsChrono;
	}
	
//	alert('UpdateSlalomFinishTime tps='+newTps+' sum='+sumPena);
	
	const oldTps = tRanking.GetCellInt('Tps'+course_phase, row);
	if (oldTps != newTps)
	{
		tRanking.UpdateRankingTime(row, tRanking.GetIndexColumn('Tps'+course_phase), tRanking.GetIndexColumn('Cltc'+course_phase), oldTps, newTps);
		
		const elemTime = document.querySelectorAll('#main table tbody tr[data-bib="'+bib+'"] td.time');
		if (elemTime && typeof elemTime === "object" && elemTime.length == 1)
			elemTime[0].innerHTML = adv.GetChronoXSCC(newTps);
		
		for (let k=0;k<tRanking.GetNbRows();k++)
		{
			const elemRank = document.querySelectorAll('#main table tbody tr[data-bib="'+tRanking.GetCell('Dossard',k)+'"] td.rank');
			if (elemRank && typeof elemRank === "object" && elemRank.length == 1)
			{
				elemRank[0].innerHTML = tRanking.GetCellRank('Cltc'+course_phase, k);
			}
		}
	}
}

function OnNotifyRaceLoad(objJSON) 
{
	wsContext.notify_race = objJSON;
	
//	alert("OnNotifyRaceLoad :"+JSON.stringify(objJSON));

	document.getElementById("container_message").innerHTML = '';
	SetBodyHeader();
	SetBodyEpreuves();
}

function SetBodyHeader() 
{
	const tCompetition = adv.GetTable(wsContext.notify_race, 'Competition');
	const tCompetition_Course = adv.GetTable(wsContext.notify_race, 'Competition_Course');
	const tCompetition_Course_Phase = adv.GetTable(wsContext.notify_race, 'Competition_Course_Phase');

	var html;
	html  = '<h1>'+tCompetition.GetCell('Nom', 0)+'<h1>';
	html += '<h2>'+tCompetition_Course.GetCell('Libelle', 0);
	html += ' - '+tCompetition_Course_Phase.GetCell('Libelle', 0)+'<h2>';
	
	const test = canoe.GetCodeActivite()+'/nbInter='+canoe.GetNbInter()+'/'+canoe.GetCodeCompetition()+'/'+canoe.GetCodeCoursePhase();
//	alert(test);
	
	document.getElementById("header").innerHTML = html;
}

function GetStateEpreuveHTML(state) 
{
	if (wsContext.lang == 'fr')
	{
		if (state == '1')
			return '<img width="16" height="16" src="./img/16x16_etat_inscription_1.png">&nbsp;En attente'; 
		else if (state == '2')
			return '<img width="16" height="16" src="./img/16x16_etat_inscription_2.png">&nbsp;Programmée'; 
		else if (state == '3')
			return '<img width="16" height="16" src="./img/16x16_etat_inscription_3.png">&nbsp;En cours'; 
		else if (state == '4')
			return '<img width="16" height="16" src="./img/16x16_etat_inscription_4.png">&nbsp;Officieux'; 
		else if (state == '5')
			return '<img width="16" height="16" src="./img/16x16_etat_inscription_5.png">&nbsp;Officiel'; 
		else
			return state;
	}
	else
	{
		if (state == '1')
			return '<img width="16" height="16" src="./img/16x16_etat_inscription_1.png">&nbsp;Waiting'; 
		else if (state == '2')
			return '<img width="16" height="16" src="./img/16x16_etat_inscription_2.png">&nbsp;Programmed'; 
		else if (state == '3')
			return '<img width="16" height="16" src="./img/16x16_etat_inscription_3.png">&nbsp;In progress'; 
		else if (state == '4')
			return '<img width="16" height="16" src="./img/16x16_etat_inscription_4.png">&nbsp;Unofficial'; 
		else if (state == '5')
			return '<img width="16" height="16" src="./img/16x16_etat_inscription_5.png">&nbsp;Official'; 
		else
			return state;
	}
}

function Refresh()
{
	if (typeof wsContext.notify_ranking === 'object')
		SetBodyEpreuve();
	else if (typeof wsContext.notify_race == "object")
		ShowEpreuves();
}

function ShowEpreuves()
{
	SetBodyEpreuves(wsContext.notify_race);
}

function SetBodyEpreuves() 
{
	const tEpreuves = adv.GetTable(wsContext.notify_race, 'Competition_Course_Phase_Manche_Epreuve');

	var html;
	html  = '<table class="table table-striped">';
	html += '<thead><tr>';
	html += '<th class="text-center">Categ</th>';
	html += '<th class="text-center">State</th>';
	html += '</tr></thead>';
	html += '<tbody>';
	for (let r = 0; r < tEpreuves.GetNbRows(); r++)
	{
		var state = tEpreuves.GetCell('Etat_programme_epreuve', r);
		
		html += '<tr>'
		html += '<td class="text-center">'+tEpreuves.GetCell('Libelle_court', r)+'</td>';
		html += '<td class="text-center"><button data-row="'+r.toString()+'">'+GetStateEpreuveHTML(state)+'</button></td>';
		html += '</tr>';
	}
	html += '</tbody>';
	html += '</table>';

	document.getElementById("main").innerHTML = html;

	[].forEach.call(document.querySelectorAll('#main table td button'), function(el) {
		el.addEventListener('click', function() {
			const r = parseInt(el.getAttribute("data-row"));
			const epreuve = tEpreuves.GetCell('Libelle_court', r);
			const cmd = { key : '<epreuve_load>',  epreuve : epreuve };
			wsContext.wsCommand.send(JSON.stringify(cmd));
		})
	})
}

function OnNotifyEpreuveLoad(objJSON) 
{
//	alert("OnNotifyEpreuveLoad :"+JSON.stringify(objJSON));
	wsContext.notify_ranking = objJSON;

	const tRanking = adv.GetTableUnique(wsContext.notify_ranking, 'ranking');
	const course_phase = canoe.GetCodeCoursePhase();
	
	if (canoe.GetCodeActivite() == 'SLA')
	{
		tRanking.SetColumnName('@RK_'+course_phase+'_1', 'Cltc'+course_phase);
		tRanking.SetColumnName('@START_TIME_'+course_phase+'_1', 'Heure_depart'+course_phase);
		tRanking.SetColumnName('@CHRONO_'+course_phase+'_1', 'Tps_chrono'+course_phase);
		tRanking.SetColumnName('@TIME_'+course_phase+'_1', 'Tps'+course_phase);
	}
	
	tRanking.OrderBy('Heure_depart'+course_phase+', Dossard');

	SetBodyEpreuve();
}

function filterDossard(table, itemRow)
{
	const bib = table.GetInt(itemRow, 'Dossard');
	if (bib > 3 && bib < 10)
		return true;
	else
		return false;
}

function SetBodyEpreuve() 
{
	if (canoe.GetCodeActivite() == 'SLA')
		SetBodyEpreuveSlalom();
	else
		SetBodyEpreuveDescente();
}

function SetBodyEpreuveSlalom() 
{
	const tRanking = adv.GetTableUnique(wsContext.notify_ranking, 'ranking')
	const course_phase = canoe.GetCodeCoursePhase();
	const nbPorte = wsContext.notify_ranking.Nb_porte;
	const nbInter = canoe.GetNbInter();
	
	var html;
	
	html  = '<h1 class="text-center">Chrono Timing <span id="clock" class="badge bg-success">23h59.59.9</span></h1>';

	html += '<table class="table table-striped">';
	html += '<thead class="table-dark" id="onCourseHeader"><tr>';
	html += '<th class="text-end" data-sort-header="Cltc'+course_phase+'">Clt</th>';
	html += '<th class="text-center" data-sort-header="Dossard">Dos.</th>';
	html += '<th class="text-center" data-sort-header="Bateau">Nom</th>';
	html += '<th class="text-center">Epreuve</th>';
	html += '<th class="text-center" data-sort-header="Club">Club</th>';
	html += '<th class="text-center" data-sort-header="Heure_depart'+course_phase+'">H.Départ</th>';

	html += '<th class="text-end" data-sort-header="Tps_chrono'+course_phase+'">Chrono</th>';
	for (let p = 1; p <= nbPorte; p++)
	{
		if (IsPorteInv(p))
			html += '<th class="gate_inv">'+p.toString()+'</th>';
		else
			html += '<th>'+p.toString()+'</th>';
	}
	html += '<th class="text-end" data-sort-header="Tps'+course_phase+'">Temps</th>';
	html += '</tr></thead>';

	html += '<tbody id="onCourse">'
	for (let r = 0; r < tRanking.GetNbRows(); r++)
	{
		var bib = tRanking.GetCell('Dossard', r);
		html += '<tr data-bib="'+bib+'">'
		html += '<td class="rank">'+tRanking.GetCellRank('Cltc'+course_phase, r)+'</td>';
		html += '<td class="bib">'+bib+'</td>';
		html += '<td class="name">'+tRanking.GetCell('Bateau', r)+'</td>';
		html += '<td class="epreuve">'+tRanking.GetCell('Code_categorie', r)+'</td>';
		html += '<td class="club">'+tRanking.GetCell('Club', r)+'</td>';
		html += '<td class="hour">'+tRanking.GetCellChrono('Heure_depart'+course_phase, r, 'HHMMSS')+'</td>';
		html += '<td class="chrono">'+tRanking.GetCellChrono('Tps_chrono'+course_phase, r, 'HHMMSSCC')+'</td>';
		
		for (let p = 1; p <= nbPorte; p++)
		{
			var pen = tRanking.GetCell('@PENA_'+p.toString()+'_1', r);
			if (pen == '0')
				html += '<td class="gate" data-col="'+p.toString()+'" data-pen="0"/>';
			else if (pen == '2')
				html += '<td class="gate" data-col="'+p.toString()+'" data-pen="2">2</td>';
			else if (pen == '50')
				html += '<td class="gate" data-col="'+p.toString()+'" data-pen="50">50</td>';
			else
				html += '<td class="gate" data-col="'+p.toString()+'" data-pen="-1"/>';
		}
		html += '<td class="time">'+tRanking.GetCellChrono('Tps'+course_phase, r, 'XSCC')+'</td>';
		html += '</tr>';
	}
	html += '</tbody>';
	html += '</table>';

	document.getElementById("main").innerHTML = html;
	
	[].forEach.call(document.querySelectorAll('#main table thead th[data-sort-header]'), function(el) {
		const sortColumn = el.getAttribute("data-sort-header");
		el.innerHTML += '&nbsp;'+tRanking.GetSortHeaderImageHTML(sortColumn);
		el.style.cursor = "pointer";
		el.addEventListener('click', function() {
			tRanking.SortHeaderColumn(sortColumn);
			SetBodyEpreuveSlalom();
		})
	});
}

function SetBodyEpreuveDescente() 
{
	const tRanking = adv.GetTableUnique(wsContext.notify_ranking, 'ranking')
	const course_phase = canoe.GetCodeCoursePhase();
	const nbInter = canoe.GetNbInter();

	var html;

	html  = '<h1 class="text-center">Chrono Timing <span id="clock" class="badge bg-success">23h59.59.9</span></h1>';

	html += '<table class="table table-striped">';
	html += '<thead class="table-dark" id="onCourseHeader"><tr>';
	html += '<th class="text-end" data-sort-header="Cltc'+course_phase+'">Clt</th>';
	html += '<th class="text-center" data-sort-header="Dossard">Dos.</th>';
	html += '<th class="text-center" data-sort-header="Bateau">Nom</th>';
	html += '<th class="text-center" data-sort-header="Heure_depart'+course_phase+'">H.Départ</th>';
	html += '<th class="text-center">Epreuve</th>';
	html += '<th class="text-center" data-sort-header="Club">Club</th>';
	
	for (let k=1;k<=nbInter;k++)
		html += '<th class="text-end" data-sort-header="Cltc'+course_phase+'_inter'+k+'" colspan="2">Inter'+k+'</td>';

	html += '<th class="text-center">Finish</th>';
	html += '</tr></thead>';

	html += '<tbody id="onCourse">'
	for (let r = 0; r < tRanking.GetNbRows(); r++)
	{
		var bib = tRanking.GetCell('Dossard', r);
		html += '<tr data-bib="'+bib+'">'
		html += '<td class="rank">'+tRanking.GetCellRank('Cltc'+course_phase, r)+'</td>';
		html += '<td class="bib">'+bib+'</td>';
		html += '<td class="name">'+tRanking.GetCell('Bateau', r)+'</td>';
		html += '<td class="hour">'+tRanking.GetCellChrono('Heure_depart'+course_phase, r, 'HHMMSS')+'</td>';
		html += '<td class="epreuve">'+tRanking.GetCell('Code_categorie', r)+'</td>';
		html += '<td class="club">'+tRanking.GetCell('Club', r)+'</td>';
		
		for (let k=1;k<=nbInter;k++)
		{
			html += '<td class="rank_inter" data-inter="'+k+'">'+tRanking.GetCellRank('Cltc'+course_phase+'_inter'+k, r)+'</td>';
			html += '<td class="time_inter" data-inter="'+k+'">'+tRanking.GetCellChrono('Tps'+course_phase+'_inter'+k, r, 'HHMMSSCC')+'</td>';
		}
		
		html += '<td class="time">'+tRanking.GetCellChrono('Tps'+course_phase, r, 'HHMMSSCC')+'</td>';
		html += '</tr>';
	}
	html += '</tbody>';
	html += '</table>';

	document.getElementById("main").innerHTML = html;
	
	[].forEach.call(document.querySelectorAll('#main table thead th[data-sort-header]'), function(el) {
		const sortColumn = el.getAttribute("data-sort-header");
		el.innerHTML += '&nbsp;'+tRanking.GetSortHeaderImageHTML(sortColumn);
		el.style.cursor = "pointer";
		el.addEventListener('click', function() {
			tRanking.SortHeaderColumn(sortColumn);
			SetBodyEpreuveDescente();
		})
	});
}

function Init()
{
	wsContext.lang = 'en';
	
	wsContext.url = 'ws://192.168.0.18';
//	wsContext.url = 'ws://192.168.1.10';
	wsContext.port = 20000;

	// Command Notification
	wsContext.mapCommand.set('<race_load>', OnNotifyRaceLoad);
	wsContext.mapCommand.set('<epreuve_load>', OnNotifyEpreuveLoad);
	
	// Broadcast Notification
	wsContext.mapBroadcast.set('<bib_time>', OnBroadcastBibTime);
	wsContext.mapBroadcast.set('<penalty_add>', OnBroadcastPenaltyAdd);
	wsContext.mapBroadcast.set('<mode_chrono>', OnBroadcastModeChrono);
	wsContext.mapBroadcast.set('<run_erase>', OnBroadcastRunErase);
	
	// Flow Notification
	wsContext.mapFlow.set('<on_course>', OnFlowOnCourse);

	// Ouverture ws 
	wsContext.OpenWebSocketCommand(OnOpenWebSocketCommand);
	wsContext.OpenWebSocketBroadcast();
	wsContext.OpenWebSocketFlow();

	// Navigation 
	[].forEach.call(document.querySelectorAll('ul#navigation li a'), function(el) {
		el.addEventListener('click', function() {
			const nav = el.getAttribute('data-nav');
			if (nav == 'epreuve') SetBodyEpreuves(wsContext.notify_race);
			else if (nav == 'refresh') document.location.reload();
		})
	})
}
