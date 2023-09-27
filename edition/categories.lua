-- Calcul des categories V1.2 7/2023

--[[ Usage : 
		<!-- Calcul de l'age test => recupere une colonne Age-->
		<lua>dofile('./edition/categories.lua')</lua>
		<lua>Calcul_Categorie(body,  $(Competition.Date_debut,'%4Y')  )</lua>
		
		Dans le body :
		<text col="6" align="right" label="C/Cat">$(Age)</text>
]]
function Calcul_Categorie(tClassement, annee_course)
--function Calcul_Categorie(tClassement, CCompetition)
	-- Ajout Colonne Age
	if tClassement:GetIndexColumn('Age') < 0 then
		tClassement:AddColumn('Age', sqlType.TEXT);
	end
	if tClassement:GetIndexColumn('Age_ordre') < 0 then
		tClassement:AddColumn('Age_ordre', sqlType.TEXT);
	end
	if tClassement:GetIndexColumn('Age_long') < 0 then
		tClassement:AddColumn('Age_long', sqlType.TEXT);
	end
	if tClassement:GetIndexColumn('Age_regroupe') < 0 then
		tClassement:AddColumn('Age_regroupe', sqlType.TEXT);
	end
	if tClassement:GetIndexColumn('Age_regroupe_ordre') < 0 then
		tClassement:AddColumn('Age_regroupe_ordre', sqlType.TEXT);
	end
	if tClassement:GetIndexColumn('Masters') < 0 then
		tClassement:AddColumn('Masters', sqlType.TEXT);
	end
	if tClassement:GetIndexColumn('Masters_ordre') < 0 then
		tClassement:AddColumn('Masters_ordre', sqlType.TEXT);
	end
	-- Parcours de la table
	local delimiter="/"
	local annee_cour=annee_course -- os.date("%Y")	
	for i=0, tClassement:GetNbRows()-1 do	

		local Epreuve = tClassement:GetCell('Code_categorie',i)
		local CodeBat = tClassement:GetCell('Code_bateau',i)
		local nb_equipiers = GetNbEquipiers(CodeBat)
		annee_naissance="5000"
		for e=1,nb_equipiers do
			local s = GetEquipier(CodeBat,e,'Naissance') -- 1 c'est le num de l'equipier 1 2... A adapter pour les C2 
			for match in (s..delimiter):gmatch('(.-)'..delimiter) do
				annee_naissance_tmp=""
				annee_naissance_tmp=match
			end
			if annee_naissance_tmp~=nil and annee_naissance_tmp~="" then
				annee_naissance=math.min( tonumber(annee_naissance_tmp),tonumber(annee_naissance))		
			end
		end		
		if (annee_naissance=="") then
			age=0
		else
			age=annee_cour-annee_naissance
		end
		local cat_age_court
		local cat_age_long
		local regroupement_age
		cat_age_court, cat_age_court_ordre, cat_age_long,regroupement_age,regroupement_age_ordre = categories_age(age)
		masters,masters_ordre = masters_age(age,Epreuve)

--app.GetAuiMessage():AddLineError( tClassement:GetCell('Bateau',i)..' : '..tClassement:GetCell('Categorie',i)..' Calcul : '..cat_age_court  ) 
	
		tClassement:SetCell('Age', i, cat_age_court);
		tClassement:SetCell('Age_ordre', i, cat_age_court_ordre);
		tClassement:SetCell('Age_long', i, cat_age_long);
		tClassement:SetCell('Age_regroupe', i, regroupement_age);
		tClassement:SetCell('Age_regroupe_ordre', i, regroupement_age_ordre);
		tClassement:SetCell('Masters', i, masters);
		tClassement:SetCell('Masters_ordre', i, masters_ordre);
	end
end

function categories_age(age)
	-- Categories d'age P B M C J...
	categorie_age = {}
	if (age==9) or (age==10) then 
		categorie_age.court="P" 
		categorie_age.long="Poussin" 
		categorie_age_ordre="B"
	elseif (age==11) or (age==12) then 
		categorie_age.court="B" 
		categorie_age.long="Benjamin" 
		categorie_age_ordre="C"
	elseif (age==13) or (age==14) then 
		categorie_age.court="M" 
		categorie_age.long="Minime"
		categorie_age_ordre="D"
	elseif (age==15) or (age==16) then 
		categorie_age.court="C" 
		categorie_age.long="Cadet" 
		categorie_age_ordre="E"
	elseif (age==17) or (age==18) then 
		categorie_age.court="J" 
		categorie_age.long="Junior" 
		categorie_age_ordre="F"
	elseif (age>=19) and (age<=34) then 
		categorie_age.court="S" 
		categorie_age.long="Senior" 
		categorie_age_ordre="G"
--[[	elseif (age>=35) then 
		categorie_age.court="V" 
		categorie_age.long="Veteran" 
		categorie_age_ordre="H" ]]--
	elseif ((age>=35) and (age<=44) ) then 
		categorie_age.court="V1-V2" 
		categorie_age.long="V1-V2" 
		categorie_age_ordre="H"
	elseif (age>=45)  then 
			if (epreuve_cour == "K1DV") then
				categorie_age.court="V3+" 
				categorie_age.long="V3+" 
				categorie_age_ordre="I"
			elseif (age<=54) then
				categorie_age.court="V3-V4" 
				categorie_age.long="V3-V4" 
				categorie_age_ordre="J"
		
			else
				categorie_age.court="V5+" 
				categorie_age.long="V5+" 
				categorie_age_ordre="K"

			end
		

	end 	

-- REGROUPEMENT AGE U15 U18 ...	
	regroupement_age = ""
	if (age>=13) and (age<=15) then 
		regroupement_age="U15"  
		regroupement_age_ordre=1
	elseif (age>=16) and (age<=18) then 
		regroupement_age="U18" 
		regroupement_age_ordre=2
	elseif (age>=19) and (age<=23) then 
		regroupement_age="U23" 
		regroupement_age_ordre=3
	elseif (age>=23) and (age<=34) then 
		regroupement_age="U34" 
		regroupement_age_ordre=4
--[[	elseif (age>=35)  then 
		regroupement_age="M35" 
		regroupement_age_ordre=5 ]]--
	elseif ((age>=35) and (age<=44) ) then 
		regroupement_age="M35" 
		regroupement_age_ordre=5
	elseif (age>=45)  then 
			if (epreuve_cour == "K1DV") then
				regroupement_age="M45+" 
				regroupement_age_ordre=6
			elseif (age<=54) then
				regroupement_age="M45" 
				regroupement_age_ordre=7
			else
				regroupement_age="M55" 
				regroupement_age_ordre=8
			end
	end 
	return categorie_age.court,categorie_age_ordre,categorie_age.long,regroupement_age,regroupement_age_ordre
end

function masters_age(age,epreuve_cour)
	if (epreuve_cour == "INV") then
		masters = ""
		masters_ordre = 1
	else
		masters = "V1+"
		masters_ordre = 1		
	end
	if ((epreuve_cour == "K1HM35") or (epreuve_cour == "C1HM35") or (epreuve_cour == "K1DM35") or (epreuve_cour == "C1DM35")) then
		if ((age>=35) and (age<=44) ) then 
			masters = "M35"
			masters_ordre = 1
		elseif (age>=45)  then 
			if (epreuve_cour == "K1DV") then
				masters = "M45+"
				masters_ordre = 2
			elseif (age<=54) then
				masters = "M45"
				masters_ordre = 2
			else
				masters = "M55"
				masters_ordre = 3
			end
		end
	end
	return masters,masters_ordre
end