-- Synthaxe Progression :
-- clt/duel/tour/ordre/tri : clt (obligatoire ...), duel, tour, ordre (non obligatoires ...)
-- exemple 1 : 12 => 12ième du tour précédent (et de tous les duels)
-- exemple 2 : 2/3 => 2ème du duel 3 du tour précédent
-- exemple 3 : 2/3/1 => 2ème du duel 3 du tour 1
-- exemple 4 : 3/1-5/2/1 => Meilleur Troisième des duels 1 à 5 du tour 2 (1er Lucky Looser)
-- exemple 5 : 3/1-5/2/2 => Deuxième Troisième des duels 1 à 5 du tour 2 (2ème Lucky Looser)
-- exemple 6 : 3/1-5/2/2/qualif => Deuxième Troisième des duels 1 à 5 du tour 2 (2ème Lucky Looser) avec tri sur les temps de Qualification
-- exemple 7 : 3/1-5/2/2/duel => Deuxième Troisième des duels 1 à 5 du tour 2 (2ème Lucky Looser) avec tri sur le temps du duel

-- Table définissant l'ensemble des progressions ...
duel_progression = {

	-- Spécial Dragon Boat
	drb5 = {
		activite = 'DRB',
		dimension = 5,
		label = { 'Demi Finale', 'Finale' },
		progression = {
			-- tour 1
			{ 
				{'5', '1', '4' }, 
				{'2', '3' } 
			}, 
			-- tour 2
			{ 
				{'2/2', '1/1', '1/2', '2/1' } 
			}
		}
	},

	drb6 = {
		activite = 'DRB',
		dimension = 6,
		label = { 'Demi Finale', 'Finale' },
		progression = {
			-- tour 1
			{ 
				{'6', '1', '4', '' }, 
				{'5', '2', '3', '' } 
			},
			-- tour 2
			{ 
				{'2/2', '1/1', '1/2', '2/1' }, 
				{ '', '3/1', '3/2', '' } 
			}
		}
	},

	drb7 = {
		activite = 'DRB',
		dimension = 7,
		label = { 'Demi Finale', 'Finale' },
		progression = {
			-- tour 1
			{ 
				{'7', '1', '4', '5' }, 
				{'6', '2', '3' } 
			},
			-- tour 2
			{ 
				{'2/2', '1/1', '1/2', '2/1'}, 
				{'4/1', '3/1', '3/2' } 
			}
		}
	},

	drb8 = {
		activite = 'DRB',
		dimension = 8,
		label = { 'Demi Finale', 'Finale' },
		progression = {
			-- tour 1
			{ 
				-- tour 1
				{ '8', '1', '4', '5' }, 
				{ '6', '2', '3', '7' } 
			},
			-- tour 2
			{
				{ '2/2', '1/1', '1/2', '2/1' }, 
				{ '4/2', '3/1', '3/2', '4/1' } 
			}
		}
	},

	-- Les Tableaux Standards ...
	std4 = 
	{
		dimension = 4,
		progression = {
			{ 
				-- tour unique: 1 duel de 4 couloirs
				{ '1', '2', '3', '4'}
			},
		}
	},
	
	std6 =
	{
		dimension = 6,
		progression = {
			{ 
				-- tour unique: 1 duel de 6 couloirs
				{ '1', '2', '3', '4', '5', '6' }
			},
		}
	},

	std8 =
	{
		dimension = 8,
		progression = {
			{ 
				-- tour 1 : 2 duels de 4 couloirs
				{ '1', '4', '5', '8' }, 
				{ '2', '3', '6', '7' }
			},
			{
				-- tour 2 : Finale A et Finale B
				{ '1/1', '1/2', '2/1', '2/2' }, 
				{ '3/1', '3/2', '4/1', '4/2' }
			}
		}
	},

	std12 =
	{
		dimension = 12,
		label = { 'Demi Finale', 'Finale' },
		progression = {
			{ 
				-- tour 1 : 2 duels de 6 couloirs
				{ '1', '4', '5', '8',  '9', '12' }, 
				{ '2', '3', '6', '7', '10', '11' }
			},
			{
				-- tour 2 : Finale A et Finale B
				{ '1/1', '1/2', '2/1', '2/2', '3/1', '3/2' }, 
				{ '4/1', '4/2', '5/1', '5/2', '6/1', '6/2' }
			}
		}
	},

	std16 =
	{
		dimension = 16,
		progression = {
			{ 
				-- tour 1 : 4 duels de 4 couloirs
				{ '1', '8',  '9', '16' }, 
				{ '4', '5', '12', '13' },
				{ '3', '6', '11', '14' },
				{ '2', '7', '10', '15' },
			},
			{ 
				-- tour 2 : 2 duels de 4
				{ '1/1', '1/2', '2/2', '2/1'}, 
				{ '1/4', '1/3', '2/3', '2/4' },
			},
			{ 
				-- tour 3 : Finale A et Finale B
				{ '1/1', '1/2', '1/3', '1/4'}, 
				{ '2/1', '2/2', '2/3', '2/4' },
			}
		}
	},

	std20 =
	{
		dimension = 20,
		label = { 'Quart de Finale', 'Demi Finale', 'Finale' },
		progression = {
			{ 
				-- tour 1 :  Quart de final => 5 duels de 4 couloirs
				{ '1', '10', '11', '20' }, 
				{ '4',  '7', '14', '17' },
				{ '5',  '6', '15', '16' },
				{ '2',  '7', '12', '19' },
				{ '3',  '8', '13', '18' },
			},
			{ 
				-- tour 2 : demie finale => 2 duels de 6 couloirs
				--									, 2eme luc
				{ '1/1', '2/1', '1/2', '2/2', '1/3', '3/1-5/1/2'}, 
				--									, 1er luc
				{ '1/4', '2/4', '1/5', '2/5', '2/3', '3/1-5/1/1'},
			},
			{ 
				-- tour  : Finale A et Finale B => 2 duel de 6 couloirs
				{ '1/1', '1/2', '2/1', '2/2', '3/1', '3/2'}, 
				{ '4/1', '4/2', '5/1', '5/2', '6/1', '6/2'}
			}
		}
	},

	std24 =
	{
		dimension = 24,
		label = { 'Quart de Finale', 'Demi Finale', 'Finale' },
		progression = {
			{ 
				-- tour 1 : 4 duels de 6 couloirs
				{ '1', '8',  '9', '16', '17', '24' }, 
				{ '4', '5', '12', '13', '20', '21' },
				{ '3', '6', '11', '14', '19', '22' },
				{ '2', '7', '10', '15', '18', '23' }
			},
			{ 
				-- tour 2 : 2 duels de 6 couloirs
				{ '1/1', '1/2', '2/2', '2/1', '3/1', '3/2' }, 
				{ '1/4', '1/3', '2/3', '2/4', '3/4', '3/3' }
			},
			{ 
				-- tour 3 : Finale A et Finale B
				{ '1/1', '1/2', '2/1', '2/2', '3/1', '3/2' }, 
				{ '4/1', '4/2', '5/1', '5/2', '6/1', '6/2' }
			}
		}
	},

	std30 =
	{
		dimension = 30,
		label = { 'Quart de Finale', 'Demi Finale', 'Finale' },
		progression = {
			{ 
				-- tour 1 :  Quart de final => 5 duels de 4 couloirs
				{ '1','10', '11', '20', '21', '30' }, 
				{ '4', '7', '14', '17', '24', '27' },
				{ '5', '6', '15', '16', '25', '26' },
				{ '2', '9', '12', '19', '22', '29' },
				{ '3', '8', '13', '18', '23', '28' },
			},
			{ 
				-- tour 2 : demie finale => 2 duels de 6 couloirs
				{ '1/1', '2/1', '1/2', '2/2', '1/3', '3/1-5/1/2' }, 
				{ '1/4', '2/4', '1/5', '2/5', '2/3', '3/1-5/1/1' }
			},
			{ 
				-- tour  : Finale A et Finale B => 2 duel de 6 couloirs
				{ '1/1', '1/2', '2/1', '2/2', '3/1', '3/2' }, 
				{ '4/1', '4/2', '5/1', '5/2', '6/1', '6/2' }
			}
		}
	},
	
	std32 =
	{
		dimension = 32,
		progression = {
			{ 
				-- tour 1 : 8 duels de 4 couloirs
				{ '1', '16', '17', '32' }, 
				{ '8',  '9', '24', '25' },
				{ '5', '12', '21', '28' },
				{ '4', '13', '20', '29' },
				{ '3', '14', '19', '30' },
				{ '6', '11', '22', '27' },
				{ '7', '10', '23', '26' },
				{ '2', '15', '18', '31' }
			},
			{ 
				-- tour 2 : 4 duels de 4 couloirs
				{ '1/1', '1/2',  '2/2', '2/1' }, 
				{ '1/4', '1/3', '2/3', '2/4' },
				{ '1/5', '1/6', '2/6', '2/5' },
				{ '1/8', '1/7', '2/7', '2/8' },
			},
			{ 
				-- tour 3 : 2 duels de 4 couloirs
				{ '1/1', '1/2', '2/2', '2/1'}, 
				{ '1/4', '1/3', '2/3', '2/4' },
			},
			{
				-- tour 4 : Finale A et finale B
				{ '1/1', '1/2', '1/3', '1/4'}, 
				{ '2/1', '2/2', '2/3', '2/4' }
			}
		}
	},

	std48 =
	{
		dimension = 48,
		progression = {
			{ 
				-- tour 1 : 8 duels de 6 couloirs
				{ '1', '16', '24', '32', '40', '48' }, 
				{ '8',  '9', '17', '25', '33', '41' },
				{ '6', '11', '19', '27', '35', '43' },
				{ '4', '13', '21', '29', '37', '45' },
				{ '3', '14', '22', '30', '38', '46' },
				{ '5', '12', '20', '28', '36', '44' },
				{ '7', '10', '18', '26', '34', '42' },
				{ '2', '15', '23', '31', '39', '47' }
			},
			{ 
				-- tour 2 : 4 duels de 6 couloirs
				{ '1/1', '1/2', '2/2', '2/1', '3/2', '3/1' }, 
				{ '1/4', '1/3', '2/3', '2/4', '3/4', '3/3' },
				{ '1/5', '1/6', '2/6', '2/5', '3/6', '3/5' },
				{ '1/8', '1/7', '2/7', '2/8', '3/8', '3/7' },
			},
			{ 
				-- tour 3 : 2 duels de 6 couloirs
				{ '1/1', '1/2', '2/2', '2/1', '3/1', '3/2' }, 
				{ '1/4', '1/3', '2/3', '2/4', '3/4', '3/3' }
			},
			{ 
				-- tour 4 : Finale A et Finale B
				{ '1/1', '1/2', '2/1', '2/2', '3/1', '3/2' }, 
				{ '4/1', '4/2', '5/1', '5/2', '6/1', '6/2' }
			}
		}
	}
};
