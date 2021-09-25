if(CookieAssistant === undefined)
{
	var CookieAssistant = {};
}
if(typeof CCSE == 'undefined')
{
	Game.LoadMod('https://klattmose.github.io/CookieClicker/SteamMods/CCSE/main.js');
}

CookieAssistant.name = 'Cookie Assistant';
CookieAssistant.version = '0.5.0';
CookieAssistant.GameVersion = '2.042';


CookieAssistant.launch = function()
{
	CookieAssistant.defaultConfig = function()
	{
		var conf = 
		{
			//各機能の有効/無効のフラグ
			flags:
			{
				autoClickBigCookie: 0,
				autoClickGoldenCookie: 0,
				autoClickReindeer: 0,
				autoClickFortuneNews: 0,
				autoClickWrinklers: 0,
				autoSpellonBuff: 0,
				autoBuyElderPledge: 0,
				autoBuyUpgrades: 0,
				autoBuyBuildings: 0,
				autoSwitchSeason: 0,
				autoTrainDragon : 0,
				autoSetSpirits : 0,
				autoHarvestSugarlump : 0,
				autoSellBuilding : 0,
			},
			//各機能の実行間隔
			intervals:
			{
				autoClickBigCookie: 1,
				autoClickGoldenCookie: 1,
				autoClickReindeer: 100,
				autoClickFortuneNews: 100,
				autoClickWrinklers: 60000,
				autoSpellonBuff: 1000,
				autoBuyElderPledge: 1000,
				autoBuyUpgrades: 1000,
				autoBuyBuildings: 1000,
				autoSwitchSeason: 1000,
				autoTrainDragon : 1000,
				autoSetSpirits : 10000,
				autoHarvestSugarlump : 60000,
				autoSellBuilding : 500,
			},
			//各機能の特殊設定　CheckConfigでの限界があるのでこれ以上深くしない
			particular:
			{
				dragon:
				{
					aura1: 0,
					aura2: 0,
				},
				spell:
				{
					mode: 0, //mp condition
					mode2: 0, //buff count condition
				},
				upgrades:
				{
					mode: 0,
				},
				buildings:
				{
					mode: 0,
				},
				spirits:
				{
					slot1: 0,
					slot2: 1,
					slot3: 2,
				},
				golden:
				{
					mode: 0,
				},
				bigCookie:
				{
					isMute: 1,
				},
				sell:
				{
					isAfterSell: [], //売却後かどうかのフラグ保持(作動中にゲームを落としても動作するように)
					target: [],
					amount: [],
					activate_mode: [],
					after_mode: [],
				},
				wrinkler:
				{
					mode: 0,
				},
			}
		};

		return conf;
	}

	CookieAssistant.init = function()
	{
		CookieAssistant.isLoaded = 1;
		CookieAssistant.restoreDefaultConfig(1);
		CookieAssistant.ReplaceGameMenu();

        CCSE.SpliceCodeIntoFunction(
			"Game.playCookieClickSound",
			2,
			"if (CookieAssistant.config.particular.bigCookie.isMute) { return; }"
		);

		CookieAssistant.showAllIntervals = false;
		CookieAssistant.isAfterSpellcast = false;

		CookieAssistant.intervalHandles = 
		{
			autoClickBigCookie: null,
			autoClickGoldenCookie: null,
			autoClickReindeer: null,
			autoClickFortuneNews: null,
			autoClickWrinklers: null,
			autoSpellonBuff: null,
			autoBuyElderPledge: null,
			autoBuyUpgrades: null,
			autoBuyBuildings: null,
			autoSwitchSeason: null,
			autoTrainDragon : null,
			autoSetSpirits : null,
			autoHarvestSugarlump : null,
			autoSellBuilding : null,
		}

		CookieAssistant.modes =
		{
			spell:
			{
				0:
				{
					desc: "MP is minimum to cast / 最低限のMP",
				},
				1:
				{
					desc: "MP is full / MPがフル",
				}
			},
			spell_buff:
			{
				0:
				{
					count: 1,
					desc: "Have one buff / バフが1つ",
				},
				1:
				{
					count: 2,
					desc: "Have two or more buffs / バフが2つ以上",
				}
			},
			upgrades:
			{
				0:
				{
					desc: "All Upgrades (includes Researches) / 全てのアップグレード(研究を含む)",
				},
				1:
				{
					desc: "All Upgrades except Researches / 研究を除く全てのアップグレード",
				},
				2:
				{
					desc: `All Upgrades that don't cause "Grandmapocalypse" / ババアポカリプスが起きない全てのアップグレード`,
				},
			},
			buildings:
			{
				0:
				{
					amount: 10,
					desc: "Buy every 10 pieces / 10個単位で購入する",
				},
				1:
				{
					amount: 50,
					desc: "Buy every 50 pieces / 50個単位で購入する",
				},
				2:
				{
					amount: 100,
					desc: "Buy every 100 pieces / 100個単位で購入する",
				},
			},
			golden:
			{
				0:
				{
					desc: "Golden Cookie including Wrath Cookie / 怒りのクッキーもクリックする"
				},
				1:
				{
					desc: "Ignore Wrath Cookie / 怒りのクッキーは無視する"
				}
			},
			sell_buildings: //建物自動売却の発動条件
			{
				0:
				{
					desc: "Have one buff / バフが1つ",
				},
				1:
				{
					desc: "Have two or more buffs / バフが2つ以上",
				},
				2:
				{
					desc: "Have click buff / クリック系のバフ",
				},
				3:
				{
					desc: "Have two or more buffs including click buff / クリック系を含めて2つ以上のバフ",
				},
				4:
				{
					desc: "After auto-spellcast / 自動詠唱の後",
				},
			},
			sell_buildings_after: //建物自動売却を行った後の動作
			{
				0:
				{
					desc: "Buy back the amount sold / 売った分だけ買い戻す",
				},
				1:
				{
					desc: "Spellcast if can, and buy back / 詠唱してから買い戻す",
				},
				2:
				{
					desc: "Do nothing / 何もしない",
				},
			},
			wrinkler:
			{
				0:
				{
					desc: "All Type / 全てのタイプ",
				},
				1:
				{
					desc: "Except Shiny Wrinkler / ピカピカのシワシワ虫を除く"
				},
			},
		}

		CookieAssistant.actions =
		{
			autoClickBigCookie: () =>
			{
				CookieAssistant.intervalHandles.autoClickBigCookie = setInterval(
					() =>
					{
						//BGMがおかしくなるので最初の1秒は実行しない
						if (Game.T < Game.fps)
						{
							return;
						}
						//転生中は動作を止める
						if (Game.OnAscend)
						{
							return;
						}
						bigCookie.click();
						Game.lastClick = 0;
					},
					CookieAssistant.config.intervals.autoClickBigCookie
				)
			},
			autoClickGoldenCookie: () =>
			{
				CookieAssistant.intervalHandles.autoClickGoldenCookie = setInterval(
					() =>
					{
						for (var i in Game.shimmers)
						{
							if(Game.shimmers[i].type == "golden")
							{
								if (CookieAssistant.config.particular.golden.mode == 1 && Game.shimmers[i].wrath != 0)
								{
									continue;
								}
								Game.shimmers[i].pop();
							}
						}
					},
					CookieAssistant.config.intervals.autoClickGoldenCookie
				)
			},
			autoClickReindeer: () =>
			{
				CookieAssistant.intervalHandles.autoClickReindeer = setInterval(
					() =>
					{
						for (var i in Game.shimmers)
						{
							if(Game.shimmers[i].type == "reindeer")
							{
								Game.shimmers[i].pop();
							}
						}
					},
					CookieAssistant.config.intervals.autoClickReindeer
				)
			},
			autoClickFortuneNews: () =>
			{
				CookieAssistant.intervalHandles.autoClickFortuneNews = setInterval(
					() =>
					{
						if (Game.TickerEffect && Game.TickerEffect.type == 'fortune')
						{
							Game.tickerL.click();
						}
					},
					CookieAssistant.config.intervals.autoClickFortuneNews
				)
			},
			autoSpellonBuff: () =>
			{
				CookieAssistant.intervalHandles.autoSpellonBuff = setInterval(
					() =>
					{
						var buffCount = 0;
						for (var i in Game.buffs)
						{
							switch(Game.buffs[i].type.name)
							{
								case "frenzy":
								case "blood frenzy": //elder frenzy (x666)
								case "dragon harvest":
								case "click frenzy":
								case "dragonflight":
								case "sugar frenzy":
								case "building buff":
									buffCount++;
									break;
								case "cursed finger": //ポジティブなバフだが、バフ同士によって相性が悪いため無視する
								case "devastation": //DevastationはMOD側で起こしたいのでユーザーが自発的に起こしたものについては無視する
								default:
									break;
							}
						}
						var grimoire = Game.ObjectsById[7].minigame;
						var spell = grimoire.spells['hand of fate'];
						var cost = 0;
						switch(CookieAssistant.config.particular.spell.mode)
						{
							case 0: //必要最低限のMP
								cost = Math.floor(spell.costMin + grimoire.magicM * spell.costPercent);
								break;
							case 1: //MP完全回復
							default:
								cost = grimoire.magicM;
								break;
						}
						if (cost <= Math.floor(grimoire.magic) && buffCount >= CookieAssistant.modes.spell_buff[CookieAssistant.config.particular.spell.mode2].count)
						{
							grimoire.castSpell(spell);
							CookieAssistant.isAfterSpellcast = true;
							setTimeout(() =>
							{
								if (CookieAssistant.isAfterSpellcast)
								{
									CookieAssistant.isAfterSpellcast = false;
								}
							}, 3000);
						}
					},
					CookieAssistant.config.intervals.autoSpellonBuff
				)
			},
			autoClickWrinklers: () =>
			{
				CookieAssistant.intervalHandles.autoClickWrinklers = setInterval(
					() =>
					{
						Game.wrinklers.forEach(wrinkler =>
						{
							if (wrinkler.close == 1)
							{
								if (CookieAssistant.config.particular.wrinkler.mode == 1 && wrinkler.type == 1)
								{
									return;
								}
								wrinkler.hp = 0;
							}
						});
					},
					CookieAssistant.config.intervals.autoClickWrinklers
				)
			},
			autoBuyElderPledge: () =>
			{
				CookieAssistant.intervalHandles.autoBuyElderPledge = setInterval(
					() =>
					{
						if (Game.UpgradesInStore.indexOf(Game.Upgrades["Elder Pledge"]) != -1)
						{
							Game.Upgrades["Elder Pledge"].buy();
						}
						//ElderPledgeを自動購入してるんだったら生贄用めん棒も買ってほしいはずなのでこっちでも見る
						if (Game.UpgradesInStore.indexOf(Game.Upgrades["Sacrificial rolling pins"]) != -1)
						{
							Game.Upgrades["Sacrificial rolling pins"].buy(1);
						}
					},
					CookieAssistant.config.intervals.autoBuyElderPledge
				)
			},
			autoBuyUpgrades: () =>
			{
				CookieAssistant.intervalHandles.autoBuyUpgrades = setInterval(
					() =>
					{
						for (var i in Game.UpgradesInStore)
						{
							var upgrade = Game.UpgradesInStore[i];
							//保管庫に入っているアップグレードは無視する
							if (upgrade.isVaulted())
							{
								continue;
							}
							//スイッチ類を除いて購入(ElderPledgeもToggle扱いなので考えなくてよい)
							//生贄用めん棒はこっちでも勝手に買われる
							if (upgrade.pool != "toggle")
							{
								//研究を除くモードの時
								if (CookieAssistant.config.particular.upgrades.mode == 1 && upgrade.pool == "tech")
								{
									continue;
								}
								//ババアポカリプスに入りたくないモードの時
								if (CookieAssistant.config.particular.upgrades.mode == 2 && upgrade.name == "One mind")
								{
									continue;
								}
								upgrade.buy(1);
							}
						}
					},
					CookieAssistant.config.intervals.autoBuyUpgrades
				);
			},
			autoSwitchSeason: () =>
			{
				CookieAssistant.intervalHandles.autoSwitchSeason = setInterval(
					() =>
					{
						var winterSantaRate = Game.GetHowManySantaDrops() / Game.santaDrops.length;
						var winterReindeerRate = Game.GetHowManyReindeerDrops() / Game.reindeerDrops.length;
						var halloweenRate = Game.GetHowManyHalloweenDrops() / Game.halloweenDrops.length;
						var easterRate = Game.GetHowManyEggs() / Game.easterEggs.length;
						var valentinesRate = Game.GetHowManyHeartDrops() / Game.heartDrops.length;

						// Game.Upgrades['Festive biscuit'].descFunc=function(){return '<div style="text-align:center;">'+Game.listTinyOwnedUpgrades(Game.santaDrops)+'<br><br>'+(EN?('You\'ve purchased <b>'+Game.GetHowManySantaDrops()+'/'+Game.santaDrops.length+'</b> of Santa\'s gifts.'):loc("Seasonal cookies purchased: <b>%1</b>.",Game.GetHowManySantaDrops()+'/'+Game.santaDrops.length))+'<div class="line"></div>'+Game.listTinyOwnedUpgrades(Game.reindeerDrops)+'<br><br>'+(EN?('You\'ve purchased <b>'+Game.GetHowManyReindeerDrops()+'/'+Game.reindeerDrops.length+'</b> reindeer cookies.'):loc("Reindeer cookies purchased: <b>%1</b>.",Game.GetHowManyReindeerDrops()+'/'+Game.reindeerDrops.length))+'<div class="line"></div>'+Game.saySeasonSwitchUses()+'<div class="line"></div></div>'+this.ddesc;};
						// Game.Upgrades['Bunny biscuit'].descFunc=function(){return '<div style="text-align:center;">'+Game.listTinyOwnedUpgrades(Game.easterEggs)+'<br><br>'+(EN?('You\'ve purchased <b>'+Game.GetHowManyEggs()+'/'+Game.easterEggs.length+'</b> eggs.'):loc("Eggs purchased: <b>%1</b>.",Game.GetHowManyEggs()+'/'+Game.easterEggs.length))+'<div class="line"></div>'+Game.saySeasonSwitchUses()+'<div class="line"></div></div>'+this.ddesc;};
						// Game.Upgrades['Ghostly biscuit'].descFunc=function(){return '<div style="text-align:center;">'+Game.listTinyOwnedUpgrades(Game.halloweenDrops)+'<br><br>'+(EN?('You\'ve purchased <b>'+Game.GetHowManyHalloweenDrops()+'/'+Game.halloweenDrops.length+'</b> halloween cookies.'):loc("Seasonal cookies purchased: <b>%1</b>.",Game.GetHowManyHalloweenDrops()+'/'+Game.halloweenDrops.length))+'<div class="line"></div>'+Game.saySeasonSwitchUses()+'<div class="line"></div></div>'+this.ddesc;};
						// Game.Upgrades['Lovesick biscuit'].descFunc=function(){return '<div style="text-align:center;">'+Game.listTinyOwnedUpgrades(Game.heartDrops)+'<br><br>'+(EN?('You\'ve purchased <b>'+Game.GetHowManyHeartDrops()+'/'+Game.heartDrops.length+'</b> heart biscuits.'):loc("Seasonal cookies purchased: <b>%1</b>.",Game.GetHowManyHeartDrops()+'/'+Game.heartDrops.length))+'<div class="line"></div>'+Game.saySeasonSwitchUses()+'<div class="line"></div></div>'+this.ddesc;};
						// Game.Upgrades['Fool\'s biscuit'].descFunc=function(){return '<div style="text-align:center;">'+Game.saySeasonSwitchUses()+'<div class="line"></div></div>'+this.ddesc;};

						// Game.seasons={
						// 	'christmas':{name:'Christmas',start:'Christmas season has started!',over:'Christmas season is over.',trigger:'Festive biscuit'},
						// 	'valentines':{name:'Valentine\'s day',start:'Valentine\'s day has started!',over:'Valentine\'s day is over.',trigger:'Lovesick biscuit'},
						// 	'fools':{name:'Business day',start:'Business day has started!',over:'Business day is over.',trigger:'Fool\'s biscuit'},
						// 	'easter':{name:'Easter',start:'Easter season has started!',over:'Easter season is over.',trigger:'Bunny biscuit'},
						// 	'halloween':{name:'Halloween',start:'Halloween has started!',over:'Halloween is over.',trigger:'Ghostly biscuit'}
						// };

						if (Game.season == "")
						{
							CookieAssistant.SwitchNextSeason();
						}
						else if (Game.season == "valentines")
						{
							if (valentinesRate >= 1)
							{
								// console.log("Complete Valentines");
								CookieAssistant.SwitchNextSeason();
							}
						}
						else if (Game.season == "christmas")
						{
							if (winterSantaRate < 1 || Game.santaLevel < 14)
							{
								Game.UpgradeSanta();
							}
							if (winterReindeerRate >= 1 && winterSantaRate >= 1 && Game.santaLevel >= 14)
							{
								// console.log("Complete Christmas");
								CookieAssistant.SwitchNextSeason();
							}
						}
						else if (Game.season == "easter")
						{
							if (easterRate >= 1)
							{
								// console.log("Complete Easter");
								CookieAssistant.SwitchNextSeason();
							}
						}
						else if (Game.season == "halloween")
						{
							//エルダー宣誓の自動購入がONのときは強制OFFにする
							if (CookieAssistant.config.flags.autoBuyElderPledge == 1)
							{
								CookieAssistant.config.flags.autoBuyElderPledge = 0;
								clearInterval(CookieAssistant.intervalHandles.autoBuyElderPledge);
								CookieAssistant.intervalHandles.autoBuyElderPledge = null;								
							}
							//エルダー宣誓の時間が残っている場合はエルダー誓約を発動する(エルダー宣誓の時間リセットのため)
							if (Game.pledgeT >= 1 && Game.UpgradesInStore.indexOf(Game.Upgrades["Elder Covenant"]) != -1)
							{
								// console.log("Buy Elder Covenant");
								Game.Upgrades["Elder Covenant"].buy();
							}
							//エルダー誓約の撤回が出来る場合はする（Wrinklerをスポーンさせる必要があるため）
							if (Game.UpgradesInStore.indexOf(Game.Upgrades["Revoke Elder Covenant"]) != -1)
							{
								// console.log("Buy Revoke Elder Covenant");
								Game.Upgrades["Revoke Elder Covenant"].buy();
							}
							if (halloweenRate >= 1)
							{
								// console.log("Complete Halloween");
								//エルダー誓約を購入してババアポカリプスを終了させてから次に行く
								Game.Upgrades["Elder Covenant"].buy(1);
								CookieAssistant.SwitchNextSeason();
							}
						}
					},
					CookieAssistant.config.intervals.autoSwitchSeason
				)
			},
			autoBuyBuildings: () =>
			{
				CookieAssistant.intervalHandles.autoBuyBuildings = setInterval(
					() =>
					{
						var amountPerPurchase = CookieAssistant.modes.buildings[CookieAssistant.config.particular.buildings.mode].amount;
						// console.log(l('products').innerHTML);
						for (const objectName in Game.Objects)
						{
							var amount = Game.Objects[objectName].amount % amountPerPurchase == 0 ? amountPerPurchase : amountPerPurchase - Game.Objects[objectName].amount % amountPerPurchase;
							var isMaxDragon = Game.dragonLevel >= Game.dragonLevels.length - 1;
							//ドラゴンの自動育成がONの場合は建物の自動購入を制限する
							if (!isMaxDragon && CookieAssistant.config.flags.autoTrainDragon && Game.Objects[objectName].amount >= 350 - amountPerPurchase)
							{
								amount = 350 - Game.Objects[objectName].amount;
								if (amount <= 0)
								{
									continue;
								}
							}
							if (Game.cookies >= Game.Objects[objectName].getSumPrice(amount))
							{
								//売却モードだったら強制的に購入モードにする
								if (Game.buyMode < 0)
								{
									Game.buyMode = 1;
								}
								Game.Objects[objectName].buy(amount);
							}
						}
					},
					CookieAssistant.config.intervals.autoBuyBuildings
				);
			},
			autoTrainDragon : () =>
			{
				CookieAssistant.intervalHandles.autoTrainDragon = setInterval(
					() =>
					{
						if (Game.dragonLevel < Game.dragonLevels.length - 1 && Game.dragonLevels[Game.dragonLevel].cost())
						{
							Game.UpgradeDragon();
							if (Game.dragonLevel == Game.dragonLevels.length - 1)
							{
								Game.dragonAura = CookieAssistant.config.particular.dragon.aura1;
								Game.dragonAura2 = CookieAssistant.config.particular.dragon.aura2;
							}
						}
					},
					CookieAssistant.config.intervals.autoTrainDragon
				);
			},
			autoSetSpirits : () =>
			{
				CookieAssistant.intervalHandles.autoSetSpirits = setInterval(
					() =>
					{
						if(Game.Objects['Temple'].minigame == undefined || !Game.Objects['Temple'].minigameLoaded)
						{
							return;
						}
						var pantheon = Game.Objects['Temple'].minigame;
						if (pantheon.slot[0] == -1)
						{
							pantheon.dragGod(pantheon.godsById[CookieAssistant.config.particular.spirits.slot1]);
							pantheon.hoverSlot(0);
							pantheon.dropGod();
							pantheon.hoverSlot(-1);
						}
						if (pantheon.slot[1] == -1)
						{
							pantheon.dragGod(pantheon.godsById[CookieAssistant.config.particular.spirits.slot2]);
							pantheon.hoverSlot(1);
							pantheon.dropGod();
							pantheon.hoverSlot(-1);
						}
						if (pantheon.slot[2] == -1)
						{
							pantheon.dragGod(pantheon.godsById[CookieAssistant.config.particular.spirits.slot3]);
							pantheon.hoverSlot(2);
							pantheon.dropGod();
							pantheon.hoverSlot(-1);
						}
					},
					CookieAssistant.config.intervals.autoSetSpirits
				);
			},
			autoHarvestSugarlump : () =>
			{
				CookieAssistant.intervalHandles.autoHarvestSugarlump = setInterval(
					() =>
					{
						//砂糖玉がアンロックされているかチェック
						if (!Game.canLumps())
						{
							return;
						}
						var age = Date.now() - Game.lumpT;
						if (age > Game.lumpRipeAge && age < Game.lumpOverripeAge)
						{
							Game.clickLump();
						}
					},
					CookieAssistant.config.intervals.autoHarvestSugarlump
				);
			},
			autoSellBuilding : () =>
			{
				CookieAssistant.intervalHandles.autoSellBuilding = setInterval(
					() =>
					{
						for(var i = 0; i < CookieAssistant.config.particular.sell.isAfterSell.length; i++)
						{
							var target = CookieAssistant.config.particular.sell.target[i];
							var amount = CookieAssistant.config.particular.sell.amount[i];
							var activate_mode = CookieAssistant.config.particular.sell.activate_mode[i];
							var after_mode = CookieAssistant.config.particular.sell.after_mode[i];
							var isSold = CookieAssistant.sellBuildings(i, target, amount, activate_mode, after_mode);
							if (isSold) //優先度が高いものを売却した場合、以降の優先度の売却はトライせずに処理を終了する
							{
								break;
							}
						}
					},
					CookieAssistant.config.intervals.autoSellBuilding
				);
			},
		}
		
		Game.Notify('CookieAssistant loaded!', '', '', 1, 1);
		CookieAssistant.CheckUpdate();
	}

	CookieAssistant.sellBuildings = function(index, target, amount, activate_mode, after_mode)
	{
		var objectName = Game.ObjectsById[target].name;
		var amount = parseInt(amount);
		if (CookieAssistant.config.particular.sell.isAfterSell[index])
		{
			if (after_mode == 2)//Do nothing
			{
				CookieAssistant.config.particular.sell.isAfterSell[index] = 0;
				return false;
			}
			if (after_mode == 1)//Spellcast and buy back
			{
				var grimoire = Game.ObjectsById[7].minigame;
				if (grimoire == undefined)
				{
					Game.Notify(CookieAssistant.name, "You have not unlocked the Grimoire yet, so failed to spellcast.<br />グリモア解放前のため、呪文の発動に失敗しました。", "", 3);
					CookieAssistant.config.particular.sell.isAfterSell[index] = 0;
					return false;
				}
				var spell = grimoire.spells['hand of fate'];
				var cost = Math.floor(spell.costMin + grimoire.magicM * spell.costPercent);
				if (cost <= Math.floor(grimoire.magic))
				{
					grimoire.castSpell(spell);
				}
			}
			if (Game.cookies >= Game.Objects[objectName].getSumPrice(amount))
			{
				if (Game.buyMode < 0)
				{
					Game.buyMode = 1;
				}
				Game.Objects[objectName].buy(amount);
			}
			else
			{
				console.log("Game.cookies :" + Game.cookies + ", Requirement : " + Game.Objects[objectName].getSumPrice(amount));
				Game.Notify(CookieAssistant.name, "クッキーが足りず建物を買い戻せませんでした。<br />Not have enough cookies to buy back");
			}
			CookieAssistant.config.particular.sell.isAfterSell[index] = 0;
			return false;
		}

		
		var buffCount = 0;
		var cliclBuffCount = 0;
		var isDuaringDevastation = false;
		for (var i in Game.buffs)
		{
			switch(Game.buffs[i].type.name)
			{
				case "dragonflight":
				case "click frenzy":
					cliclBuffCount++;
					buffCount++;
					break;
				case "dragon harvest":
				case "frenzy":
				case "blood frenzy": //elder frenzy (x666)
				case "sugar frenzy":
				case "building buff":
					buffCount++;
					break;
				case "devastation":
					isDuaringDevastation = true;
					break;
				case "cursed finger":
				default:
					break;
			}
		}
		//ゴジャモックのバフ中なので何もしない
		if (isDuaringDevastation)
		{
			return false;
		}
		var isMode0 = activate_mode == 0 && buffCount >= 1;
		var isMode1 = activate_mode == 1 && buffCount >= 2;
		var isMode2 = activate_mode == 2 && cliclBuffCount >= 1;
		var isMode3 = activate_mode == 3 && buffCount >= 2 && cliclBuffCount >= 1;
		var isMode4 = activate_mode == 4 && CookieAssistant.isAfterSpellcast;
		if (isMode0 || isMode1 || isMode2 || isMode3 || isMode4)
		{
			if (Game.Objects[objectName].amount < amount)
			{
				Game.Notify(CookieAssistant.name, "建物が少ないため売却に失敗しました。<br />Could not sell buildings due to not enough.");
				return false;
			}
			Game.Objects[objectName].sell(amount);
			CookieAssistant.config.particular.sell.isAfterSell[index] = 1;
			CookieAssistant.isAfterSpellcast = false;
			return true;
		}
	}

	CookieAssistant.restoreDefaultConfig = function(mode){
		CookieAssistant.config = CookieAssistant.defaultConfig();
		if(mode == 2)
		{
			CookieAssistant.save(CookieAssistant.config);
		}
	}

	CookieAssistant.SwitchNextSeason = function()
	{
		var seasons = ["valentines", "christmas", "easter", "halloween"];
		var isCompletes = [
			(Game.GetHowManyHeartDrops() / Game.heartDrops.length) >= 1,
			((Game.GetHowManySantaDrops() / Game.santaDrops.length) >= 1) && ((Game.GetHowManyReindeerDrops() / Game.reindeerDrops.length) >= 1) && Game.santaLevel >= 14,
			(Game.GetHowManyEggs() / Game.easterEggs.length) >= 1,
			(Game.GetHowManyHalloweenDrops() / Game.halloweenDrops.length) >= 1,
		];
		
		var targetSeason = "";
		// console.log("シーズン獲得状況 : ");
		// console.log(isCompletes);
		
		for (var i in seasons)
		{
			if (!isCompletes[i])
			{
				targetSeason = seasons[i];
				break;
			}
		}
		//全シーズンのアップグレードが完了していて現在どこかのシーズンになっている時、現在のシーズンを解除する
		if (Game.season != "" && targetSeason == "")
		{
			targetSeason = Game.season;
		}
		if (targetSeason != "")
		{
			// console.log("ChangeSeason : " + targetSeason);
			if (targetSeason == Game.season)
			{
				//値の直接書き換えになってしまうが、内部のシーズンキャンセルの挙動もこれなので許してくれ
				Game.seasonT = -1;
			}
			else if (Game.UpgradesInStore.indexOf(Game.Upgrades[Game.seasons[targetSeason].trigger]) != -1)
			{
				Game.Upgrades[Game.seasons[targetSeason].trigger].buy(1);
			}
		}
	}

	//コンフィグのチェック
	//アプデ時に新規項目がundefinedになって1ms周期の実行になってしまうのを防止
	CookieAssistant.CheckConfig = function()
	{		
		var defaultConfig = CookieAssistant.defaultConfig();
		for (const [key, value] of Object.entries(defaultConfig.flags))
		{
			if (CookieAssistant.config.flags[key] == undefined)
			{
				CookieAssistant.config.flags[key] = value;
			}
		}
		for (const [key, value] of Object.entries(defaultConfig.intervals))
		{
			if (CookieAssistant.config.intervals[key] == undefined)
			{
				CookieAssistant.config.intervals[key] = value;
			}
		}
		if (CookieAssistant.config.particular == undefined)
		{
			CookieAssistant.config.particular = defaultConfig.particular;
		}
		
		for (const [key, value] of Object.entries(defaultConfig.particular))
		{
			if (CookieAssistant.config.particular[key] == undefined)
			{
				CookieAssistant.config.particular[key] = value;
			}
			for (const [key_p, value_p] of Object.entries(defaultConfig.particular[key]))
			{
				if (CookieAssistant.config.particular[key][key_p] == undefined)
				{
					CookieAssistant.config.particular[key][key_p] = value_p;
				}
			}
		}
	}


	//オプション&統計の追加
	CookieAssistant.ReplaceGameMenu = function()
	{
		Game.customOptionsMenu.push(function()
		{
			CCSE.AppendCollapsibleOptionsMenu(CookieAssistant.name, CookieAssistant.getMenuString());
		});
		
		Game.customStatsMenu.push(function()
		{
			CCSE.AppendStatsVersionNumber(CookieAssistant.name, CookieAssistant.version);
		});
	}
	
	CookieAssistant.getMenuString = function()
	{
		let m = CCSE.MenuHelper;
		str = m.Header('Basic Assists');
		//大クッキークリック
		str +=	'<div class="listing">'
				+ m.ToggleButton(CookieAssistant.config.flags, 'autoClickBigCookie', 'CookieAssistant_autoClickBigCookieButton', 'AutoClick BigCookie ON', 'AutoClick BigCookie OFF', "CookieAssistant.Toggle")
				+ '<label>Interval(ms) : </label>'
				+ m.InputBox("CookieAssistant_Interval_autoClickBigCookie", 40, CookieAssistant.config.intervals.autoClickBigCookie, "CookieAssistant.ChangeInterval('autoClickBigCookie', this.value)")
					+ '<label></label><a class="option" ' + Game.clickStr + '=" CookieAssistant.config.particular.bigCookie.isMute++; if(CookieAssistant.config.particular.bigCookie.isMute >= 2){CookieAssistant.config.particular.bigCookie.isMute = 0;} Game.UpdateMenu(); PlaySound(\'snd/tick.mp3\');">'
							+ (CookieAssistant.config.particular.bigCookie.isMute ? 'Mute Click SE' : 'Play Click SE')
					+ '</a><br />'
				+ '</div>';
		//黄金クッキークリック
		str +=	'<div class="listing">' + m.ToggleButton(CookieAssistant.config.flags, 'autoClickGoldenCookie', 'CookieAssistant_autoClickGoldenCookieButton', 'AutoClick ' + loc("Golden cookie") + ' ON', 'AutoClick ' + loc("Golden cookie") + ' OFF', "CookieAssistant.Toggle")
				+ '<label>Interval(ms) : </label>'
				+ m.InputBox("CookieAssistant_Interval_autoClickBigCookie", 40, CookieAssistant.config.intervals.autoClickGoldenCookie, "CookieAssistant.ChangeInterval('autoClickGoldenCookie', this.value)")
				+ '<div class="listing">'
					+ '<label>MODE : </label>'
					+ '<a class="option" ' + Game.clickStr + '=" CookieAssistant.config.particular.golden.mode++; if(CookieAssistant.config.particular.golden.mode >= Object.keys(CookieAssistant.modes.golden).length){CookieAssistant.config.particular.golden.mode = 0;} Game.UpdateMenu(); PlaySound(\'snd/tick.mp3\');">'
							+ CookieAssistant.modes.golden[CookieAssistant.config.particular.golden.mode].desc
					+ '</a><br />'
				+ '</div>'
				+ '</div>';
		//虫撃破
		str +=	'<div class="listing">' + m.ToggleButton(CookieAssistant.config.flags, 'autoClickWrinklers', 'CookieAssistant_autoClickWrinklers', 'AutoClick ' + loc("wrinkler") + ' ON', 'AutoClick ' + loc("wrinkler") + ' OFF', "CookieAssistant.Toggle")
				+ '<label>Interval(ms) : </label>'
				+ m.InputBox("CookieAssistant_Interval_autoClickWrinklers", 40, CookieAssistant.config.intervals.autoClickWrinklers, "CookieAssistant.ChangeInterval('autoClickWrinklers', this.value)")
				+ '<div class="listing">'
							+ '<label>MODE : </label>'
							+ '<a class="option" ' + Game.clickStr + '=" CookieAssistant.config.particular.wrinkler.mode++; if(CookieAssistant.config.particular.wrinkler.mode >= Object.keys(CookieAssistant.modes.wrinkler).length){CookieAssistant.config.particular.wrinkler.mode = 0;} Game.UpdateMenu(); PlaySound(\'snd/tick.mp3\');">'
									+ CookieAssistant.modes.wrinkler[CookieAssistant.config.particular.wrinkler.mode].desc
							+ '</a><br />'
						+ '</div>'
				+ '</div>';
		//トナカイクリック
		str +=  '<div class="listing">' + m.ToggleButton(CookieAssistant.config.flags, 'autoClickReindeer', 'CookieAssistant_autoClickReindeerButton', 'AutoClick ' + loc("Reindeer") + ' ON', 'AutoClick ' + loc("Reindeer") + ' OFF', "CookieAssistant.Toggle");
				if (CookieAssistant.showAllIntervals)
				{
					str += '<label>Interval(ms) : </label>'
						+ m.InputBox("CookieAssistant_Interval_autoClickReindeer", 40, CookieAssistant.config.intervals.autoClickReindeer, "CookieAssistant.ChangeInterval('autoClickReindeer', this.value)");
				}
		str +=	'</div>';
		//FortuneNewsクリック
		str +=	'<div class="listing">' + m.ToggleButton(CookieAssistant.config.flags, 'autoClickFortuneNews', 'CookieAssistant_autoClickFortuneNewsButton', 'AutoClick FortuneNews ON', 'AutoClick FortuneNews OFF', "CookieAssistant.Toggle");
				if (CookieAssistant.showAllIntervals)
				{
					str += '<label>Interval(ms) : </label>'
						+ m.InputBox("CookieAssistant_Interval_autoClickFortuneNews", 40, CookieAssistant.config.intervals.autoClickFortuneNews, "CookieAssistant.ChangeInterval('autoClickFortuneNews', this.value)");
				}
		str +=	'</div>';
		//ElderPedge自動購入
		str +=	'<div class="listing">' + m.ToggleButton(CookieAssistant.config.flags, 'autoBuyElderPledge', 'CookieAssistant_autoBuyElderPledge', 'AutoBuy ' + loc("[Upgrade name 74]Elder Pledge") + ' ON', 'AutoBuy ' + loc("[Upgrade name 74]Elder Pledge") + ' OFF', "CookieAssistant.Toggle");
				if (CookieAssistant.showAllIntervals)
				{
					str += '<label>Interval(ms) : </label>'
						+ m.InputBox("CookieAssistant_Interval_autoBuyElderPledge", 40, CookieAssistant.config.intervals.autoBuyElderPledge, "CookieAssistant.ChangeInterval('autoBuyElderPledge', this.value)");
				}
		str +=	'<div class="listing">'
					+ '<label>※この機能はアップグレードの生贄用めん棒も自動で購入するようになります。</label><br />'
					+ '<label>This feature will also automatically purchase "Sacrificial rolling pins".</label><br />'
				+ '</div>'
				+ '</div>';
		//アップグレード自動購入
		str +=	'<div class="listing">' + m.ToggleButton(CookieAssistant.config.flags, 'autoBuyUpgrades', 'CookieAssistant_autoBuyUpgrades', 'AutoBuy ' + loc("upgrade") + ' ON', 'AutoBuy ' + loc("upgrade") + ' OFF', "CookieAssistant.Toggle");
				if (CookieAssistant.showAllIntervals)
				{
					str += '<label>Interval(ms) : </label>'
						+ m.InputBox("CookieAssistant_Interval_autoBuyUpgrades", 40, CookieAssistant.config.intervals.autoBuyUpgrades, "CookieAssistant.ChangeInterval('autoBuyUpgrades', this.value)");
				}
		str +=	'<div class="listing">'
					+ '<label>MODE : </label>'
					+ '<a class="option" ' + Game.clickStr + '=" CookieAssistant.config.particular.upgrades.mode++; if(CookieAssistant.config.particular.upgrades.mode >= Object.keys(CookieAssistant.modes.upgrades).length){CookieAssistant.config.particular.upgrades.mode = 0;} Game.UpdateMenu(); PlaySound(\'snd/tick.mp3\');">'
							+ CookieAssistant.modes.upgrades[CookieAssistant.config.particular.upgrades.mode].desc
					+ '</a><br />'
				+ '</div>'
				+ '</div>';
		//建物自動購入
		str +=	'<div class="listing">' + m.ToggleButton(CookieAssistant.config.flags, 'autoBuyBuildings', 'CookieAssistant_autoBuyBuildings', 'AutoBuy ' + loc("building") + ' ON', 'AutoBuy ' + loc("building") + ' OFF', "CookieAssistant.Toggle");
				if (CookieAssistant.showAllIntervals)
				{
					str += '<label>Interval(ms) : </label>'
						+ m.InputBox("CookieAssistant_Interval_autoBuyBuildings", 40, CookieAssistant.config.intervals.autoBuyBuildings, "CookieAssistant.ChangeInterval('autoBuyBuildings', this.value)");
				}
		str +=	'<div class="listing">'
					+ '<label>MODE : </label>'
					+ '<a class="option" ' + Game.clickStr + '=" CookieAssistant.config.particular.buildings.mode++; if(CookieAssistant.config.particular.buildings.mode >= Object.keys(CookieAssistant.modes.buildings).length){CookieAssistant.config.particular.buildings.mode = 0;} Game.UpdateMenu(); PlaySound(\'snd/tick.mp3\');">'
							+ CookieAssistant.modes.buildings[CookieAssistant.config.particular.buildings.mode].desc
					+ '</a><br />'
				+ '</div>'
				+ '</div>';
		//砂糖玉自動収穫
		str +=	'<div class="listing">' + m.ToggleButton(CookieAssistant.config.flags, 'autoHarvestSugarlump', 'CookieAssistant_autoHarvestSugarlump', 'AutoHarvest ' + loc("sugar lump") + ' ON', 'AutoHarvest ' + loc("sugar lump") + ' OFF', "CookieAssistant.Toggle");
				if (CookieAssistant.showAllIntervals)
				{
					str += '<label>Interval(ms) : </label>'
						+ m.InputBox("CookieAssistant_Interval_autoHarvestSugarlump", 40, CookieAssistant.config.intervals.autoHarvestSugarlump, "CookieAssistant.ChangeInterval('autoHarvestSugarlump', this.value)");
				}
		str +=	'</div>';
		
		str += "<br>"
		str += m.Header('Advanced Assists');

		//自動詠唱
		str +=	'<div class="listing">' + m.ToggleButton(CookieAssistant.config.flags, 'autoSpellonBuff', 'CookieAssistant_autoSpellonBuff', 'AutoSpellCast ' + loc("Force the Hand of Fate") + ' ON', 'AutoSpellCast ' + loc("Force the Hand of Fate") + ' OFF', "CookieAssistant.Toggle");
				if (CookieAssistant.showAllIntervals)
				{
					str += '<label>Interval(ms) : </label>'
						+ m.InputBox("CookieAssistant_Interval_autoSpellonBuff", 40, CookieAssistant.config.intervals.autoSpellonBuff, "CookieAssistant.ChangeInterval('autoSpellonBuff', this.value)");
				}
		str +=	'<div class="listing">'
					+ '<label>MODE : </label>'
					+ '<a class="option" ' + Game.clickStr + '=" CookieAssistant.config.particular.spell.mode++; if(CookieAssistant.config.particular.spell.mode >= Object.keys(CookieAssistant.modes.spell).length){CookieAssistant.config.particular.spell.mode = 0;} Game.UpdateMenu(); PlaySound(\'snd/tick.mp3\');">'
							+ CookieAssistant.modes.spell[CookieAssistant.config.particular.spell.mode].desc
					+ '</a>'
					+ '<label> AND </label>'
					+ '<a class="option" ' + Game.clickStr + '=" CookieAssistant.config.particular.spell.mode2++; if(CookieAssistant.config.particular.spell.mode2 >= Object.keys(CookieAssistant.modes.spell_buff).length){CookieAssistant.config.particular.spell.mode2 = 0;} Game.UpdateMenu(); PlaySound(\'snd/tick.mp3\');">'
							+ CookieAssistant.modes.spell_buff[CookieAssistant.config.particular.spell.mode2].desc
					+ '</a>'
				+ '</div>'
				+ '</div>';
		
		//シーズン自動切換え
		str +=	'<div class="listing">' + m.ToggleButton(CookieAssistant.config.flags, 'autoSwitchSeason', 'CookieAssistant_autoSwitchSeason', 'AutoSwitch Seasons ON', 'AutoSwitch Seasons OFF', "CookieAssistant.Toggle");
				if (CookieAssistant.showAllIntervals)
				{
					str +='<label>Interval(ms) : </label>'
						+ m.InputBox("CookieAssistant_Interval_autoSwitchSeason", 40, CookieAssistant.config.intervals.autoSwitchSeason, "CookieAssistant.ChangeInterval('autoSwitchSeason', this.value)");
				}
		str +=	'<div class="listing">'
					+ '<label>アップグレードが残っているシーズンに自動的に切り替えます。</label><br />'
					+ '<label>Automatically switch to seasons in which the upgrade is still remained. </label><br />'
				+ '</div>'
				+ '</div>';

		//ドラゴン自動育成
		str +=	'<div class="listing">' + m.ToggleButton(CookieAssistant.config.flags, 'autoTrainDragon', 'CookieAssistant_autoTrainDragon', 'AutoTrain Dragon ON', 'AutoTrain Dragon OFF', "CookieAssistant.Toggle");
				if (CookieAssistant.showAllIntervals)
				{
					str += '<label>Interval(ms) : </label>'
						+ m.InputBox("CookieAssistant_Interval_autoTrainDragon", 40, CookieAssistant.config.intervals.autoTrainDragon, "CookieAssistant.ChangeInterval('autoTrainDragon', this.value)");
				}
		str +=	'<div class="listing">'
					+ '<label>Aura1 : </label>'
						+ '<a class="option" ' + Game.clickStr + '=" CookieAssistant.config.particular.dragon.aura1++; if(CookieAssistant.config.particular.dragon.aura1 >= Object.keys(Game.dragonAuras).length){CookieAssistant.config.particular.dragon.aura1 = 0;} Game.UpdateMenu(); PlaySound(\'snd/tick.mp3\');">'
							+ Game.dragonAuras[CookieAssistant.config.particular.dragon.aura1].dname
						+ '</a>'
					+ '<label>      Aura2 : </label>'
						+ '<a class="option" ' + Game.clickStr + '=" CookieAssistant.config.particular.dragon.aura2++; if(CookieAssistant.config.particular.dragon.aura2 >= Object.keys(Game.dragonAuras).length){CookieAssistant.config.particular.dragon.aura2 = 0;} Game.UpdateMenu(); PlaySound(\'snd/tick.mp3\');">'
							+ Game.dragonAuras[CookieAssistant.config.particular.dragon.aura2].dname
						+ '</a><br />'
				+ '</div>'
				+ '</div>';

		//パンテオンのスロット自動セット
		str +=	'<div class="listing">' + m.ToggleButton(CookieAssistant.config.flags, 'autoSetSpirits', 'CookieAssistant_autoSetSpirits', 'AutoSet Spirits ON', 'AutoSet Spirits OFF', "CookieAssistant.Toggle");
				if (CookieAssistant.showAllIntervals)
				{
					str += '<label>Interval(ms) : </label>'
						+ m.InputBox("CookieAssistant_Interval_autoSetSpirits", 40, CookieAssistant.config.intervals.autoSetSpirits, "CookieAssistant.ChangeInterval('autoSetSpirits', this.value)");
				}
		str +=	'<div class="listing">';

				if (Game.Objects['Temple'].minigame != undefined && Game.Objects['Temple'].minigameLoaded)
				{
					str +=	'<label>Diamond : </label>'
							+ `<a class="option" ` + Game.clickStr + `=" CookieAssistant.config.particular.spirits.slot1++; if(CookieAssistant.config.particular.spirits.slot1 >= Object.keys(Game.Objects['Temple'].minigame.gods).length){CookieAssistant.config.particular.spirits.slot1 = 0;} Game.UpdateMenu();">`
								+ Game.Objects['Temple'].minigame.godsById[CookieAssistant.config.particular.spirits.slot1].name
							+ '</a>'
							+ '<label>Ruby : </label>'
							+ `<a class="option" ` + Game.clickStr + `=" CookieAssistant.config.particular.spirits.slot2++; if(CookieAssistant.config.particular.spirits.slot2 >= Object.keys(Game.Objects['Temple'].minigame.gods).length){CookieAssistant.config.particular.spirits.slot2 = 0;} Game.UpdateMenu();">`
								+ Game.Objects['Temple'].minigame.godsById[CookieAssistant.config.particular.spirits.slot2].name
							+ '</a>'
							+ '<label>Jade : </label>'
							+ `<a class="option" ` + Game.clickStr + `=" CookieAssistant.config.particular.spirits.slot3++; if(CookieAssistant.config.particular.spirits.slot3 >= Object.keys(Game.Objects['Temple'].minigame.gods).length){CookieAssistant.config.particular.spirits.slot3 = 0;} Game.UpdateMenu();">`
								+ Game.Objects['Temple'].minigame.godsById[CookieAssistant.config.particular.spirits.slot3].name
							+ '</a>';
				}
				else
				{
					str += "<label>⚠️パンテオンがロックされています。アンロックするまでこの機能は使えません。</label><br />";
					str += "<label>⚠️You have not unlocked the Pantheon yet. This feature will not be available until it is unlocked.</label><br />";
				}
		str +=	'</div></div>'
		
		//建物自動売却
		str +=	'<div class="listing">' + m.ToggleButton(CookieAssistant.config.flags, 'autoSellBuilding', 'CookieAssistant_autoSellBuilding', 'AutoSell Buildings ON', 'AutoSell Buildings OFF', "CookieAssistant.Toggle");
				if (CookieAssistant.showAllIntervals)
				{
					str += '<label>Interval(ms) : </label>'
						+ m.InputBox("CookieAssistant_Interval_autoSellBuilding", 40, CookieAssistant.config.intervals.autoSellBuilding, "CookieAssistant.ChangeInterval('autoSellBuilding', this.value)");
				}
		str +=	'<div class="listing"><ol style="list-style: inside;list-style-type: decimal;">';
				for (var i_sellconf = 0; i_sellconf < CookieAssistant.config.particular.sell.isAfterSell.length; i_sellconf++)
				{
					str += '<li><label>Sell </label>'
						+ '<a class="option" ' + Game.clickStr + '="CookieAssistant.config.particular.sell.target[' + i_sellconf + ']++; if(CookieAssistant.config.particular.sell.target[' + i_sellconf + '] >= Object.keys(Game.Objects).length){CookieAssistant.config.particular.sell.target[' + i_sellconf + '] = 0;} Game.UpdateMenu(); PlaySound(\'snd/tick.mp3\');">'
							+ Game.ObjectsById[CookieAssistant.config.particular.sell.target[i_sellconf]].dname
						+ '</a>'
					+ '<label> for </label>'
					+ m.InputBox("CookieAssistant_Amount_autoSellBuilding", 40, CookieAssistant.config.particular.sell.amount[i_sellconf], "CookieAssistant.config.particular.sell.amount[" + i_sellconf + "] = this.value;")
					+ '<label>When </label>'
						+ '<a class="option" ' + Game.clickStr + '=" CookieAssistant.config.particular.sell.activate_mode[' + i_sellconf + ']++; if(CookieAssistant.config.particular.sell.activate_mode[' + i_sellconf + '] >= Object.keys(CookieAssistant.modes.sell_buildings).length){CookieAssistant.config.particular.sell.activate_mode[' + i_sellconf + '] = 0;} Game.UpdateMenu(); PlaySound(\'snd/tick.mp3\');">'
							+ CookieAssistant.modes.sell_buildings[CookieAssistant.config.particular.sell.activate_mode[i_sellconf]].desc
						+ '</a><br />'
					+ '<label>Do After Activated / 発動後にやること : </label>'
						+ '<a class="option" ' + Game.clickStr + '=" CookieAssistant.config.particular.sell.after_mode[' + i_sellconf + ']++; if(CookieAssistant.config.particular.sell.after_mode[' + i_sellconf + '] >= Object.keys(CookieAssistant.modes.sell_buildings_after).length){CookieAssistant.config.particular.sell.after_mode[' + i_sellconf + '] = 0;} Game.UpdateMenu(); PlaySound(\'snd/tick.mp3\');">'
							+ CookieAssistant.modes.sell_buildings_after[CookieAssistant.config.particular.sell.after_mode[i_sellconf]].desc
						+ '</a><br /></li>';
				}
		str +=	'</ol>';
		if (CookieAssistant.config.particular.sell.isAfterSell.length < Object.keys(CookieAssistant.modes.sell_buildings).length)
		{
			str +=	'<a class="option" ' + Game.clickStr + '="CookieAssistant.addSellConfig(); Game.UpdateMenu(); PlaySound(\'snd/tick.mp3\');">Add Config</a>';
		}
		if (CookieAssistant.config.particular.sell.isAfterSell.length > 0)
		{
			str +=	'<a class="option" ' + Game.clickStr + '="CookieAssistant.removeSellConfig(); Game.UpdateMenu(); PlaySound(\'snd/tick.mp3\');">Remove Last</a>';
		}
		str +=	'</div></div>';
				
		if (CookieAssistant.config.flags.autoSellBuilding)
		{
			var temple = Game.Objects['Temple'].minigame;
			if (temple == undefined || !Game.Objects['Temple'].minigameLoaded || !temple.slot.includes(2))
			{
				str += "<label><b style='color: #ff0000'>⚠️ゴジャモックがセットされていないため、有効化しても恩恵が無い可能性があります。</b></label><br />";
				str += "<label><b style='color: #ff0000'>⚠️Godzamok is not set, so there may be no benefit from enabling this.</b></label><br />";
			}
		}
		if (CookieAssistant.config.particular.sell.activate_mode.filter((x, i, self) => self.indexOf(x) != i).length > 0)
		{
			str += "<label><b style='color: #ff0000'>⚠️発動条件が同一の設定があるため、無意味な売却が発生する可能性があります。</b></label><br />";
			str += "<label><b style='color: #ff0000'>⚠️There are settings with same triggering conditions, so may sell buildings in meaningless.</b></label><br />";
		}

		str += "<br />"
		str += m.Header('Misc');
		str += '<div class="listing">'
				+ m.ActionButton("CookieAssistant.showAllIntervals = !CookieAssistant.showAllIntervals; Game.UpdateMenu();", (CookieAssistant.showAllIntervals ? 'Hide' : 'Show All') + ' Interval Settings')
				+ m.ActionButton("CookieAssistant.restoreDefaultConfig(2); CookieAssistant.DoAction(); Game.UpdateMenu();", 'Restore Default')
				+ m.ActionButton("CookieAssistant.CheckUpdate();", 'Check Update')
				+ m.ActionButton("Steam.openLink('https://steamcommunity.com/sharedfiles/filedetails/?id=2596469882');", 'Get more information')
				+ '<label>Version : ' + CookieAssistant.version + '</label>'
			+ '</div>';

		return str;
	}
	
	CookieAssistant.Toggle = function(prefName, button, on, off, invert)
	{
		if(CookieAssistant.config.flags[prefName])
		{
			l(button).innerHTML = off;
			CookieAssistant.config.flags[prefName] = 0;
		}
		else
		{
			l(button).innerHTML = on;
			CookieAssistant.config.flags[prefName] = 1;
		}
		l(button).className = 'option' + ((CookieAssistant.config.flags[prefName] ^ invert) ? '' : ' off');
		CookieAssistant.DoAction();
	}

	CookieAssistant.ChangeInterval = function(prefName, value)
	{
		CookieAssistant.config.intervals[prefName] = value;
		CookieAssistant.DoAction();
	}

	CookieAssistant.DoAction = function()
	{
		for (const [key, isClick] of Object.entries(CookieAssistant.config.flags))
		{
			if (isClick)
			{
				if (CookieAssistant.intervalHandles[key] == null)
				{
					CookieAssistant.actions[key]();
				}
				else
				{
					clearInterval(CookieAssistant.intervalHandles[key]);
					CookieAssistant.intervalHandles[key] = null;
					CookieAssistant.actions[key]();
				}
			}
			else if (CookieAssistant.intervalHandles[key] != null)
			{
				clearInterval(CookieAssistant.intervalHandles[key]);
				CookieAssistant.intervalHandles[key] = null;
			}
		}
	}

	CookieAssistant.addSellConfig = function()
	{
		CookieAssistant.config.particular.sell.isAfterSell.push(0);
		CookieAssistant.config.particular.sell.target.push(0);
		CookieAssistant.config.particular.sell.amount.push(0);
		CookieAssistant.config.particular.sell.activate_mode.push(0);
		CookieAssistant.config.particular.sell.after_mode.push(0);
		return;
	}

	CookieAssistant.removeSellConfig = function()
	{
		CookieAssistant.config.particular.sell.isAfterSell.pop();
		CookieAssistant.config.particular.sell.target.pop();
		CookieAssistant.config.particular.sell.amount.pop();
		CookieAssistant.config.particular.sell.activate_mode.pop();
		CookieAssistant.config.particular.sell.after_mode.pop();
		return;
	}
	
	CookieAssistant.save = function()
	{
		return JSON.stringify(CookieAssistant.config);
	}

	CookieAssistant.load = function(str)
	{
		CookieAssistant.config = JSON.parse(str);
		CookieAssistant.CheckConfig();
		CookieAssistant.DoAction();
	}
	
	CookieAssistant.CheckUpdate = async function()
	{
		var res = await fetch("https://api.github.com/repos/hitsub/CookieAssistant/releases/latest")
		var json = await res.json()

		if(json.tag_name == CookieAssistant.version)
		{
			Game.Notify(CookieAssistant.name, '最新版です<br>This is the latest version', "", 3)
			return;
		}

		Game.Notify(CookieAssistant.name, `<b style="color: #ff8000">アップデートがあります<br>There will be an update.</b><br><a ${Game.clickStr}="Steam.openLink('${json.assets[0].browser_download_url}')" target="_brank">ここからダウンロードしてください。<br>Download Here</a>`)
		Game.UpdateMenu();
	}

	if(CCSE.ConfirmGameVersion(CookieAssistant.name, CookieAssistant.version, CookieAssistant.GameVersion))
	{
		Game.registerMod(CookieAssistant.name, CookieAssistant);
	}
}

if(!CookieAssistant.isLoaded)
{
	if(CCSE && CCSE.isLoaded)
	{
		CookieAssistant.launch();
	}
	else
	{
		if(!CCSE) var CCSE = {};
		if(!CCSE.postLoadHooks) CCSE.postLoadHooks = [];
		CCSE.postLoadHooks.push(CookieAssistant.launch);
	}
}
