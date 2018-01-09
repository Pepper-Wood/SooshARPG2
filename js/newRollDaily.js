var dailyType, locationType, sooshName, successModifier, skillBoost, dieRoll, dailyRollStr;
var stats = TAFFY();
var companionHandlingCases = [
    ["playing frisbee",
     "Oh no! Looks like SOOSH got too excited and accidentally hit COMPANION in the head with the frisbee.",
     "It seems like COMPANION is getting the hang of it, even if they're not able to throw the frisbee back at SOOSH accurately.",
     "It seems like COMPANION is really good at this! In fact, the two of them wore themselves out from playing frisbee the whole afternoon.",
     "Wow! COMPANION is a natural at this! Maybe the two of you should consider becoming ultimate frisbee players. COMPANION is excited to play catch again another time."],
     ["playing at an obstacle course",
      "Oh no! COMPANION got tripped up and face-planted into the ground after trying to jump the first obstacle.",
      "Looks like the two of them were okay today. Even though COMPANION wasn't able to jump over a couple of the obstacles, they're excited to try this again and hopefully do better next time.",
      "Looks like the two of them were pretty good today. They completed the course quickly, although each of them tripped over a couple of the obstacles. If they practice just a little bit more, they could get the fastest time for the course!",
      "Wow! The two of them were naturals at this! In fact, together they might have the highest score for the course!"],
     ["learning tricks",
      "Oh no! They decided to try playing patty-cake at first, but SOOSH accidentally hit COMPANION in the face.",
      "Looks like COMPANION is getting the hang of it. They can sit and lie down on command, but they're still confused about what other commands mean.",
      "COMPANION really impressed SOOSH today! On top of learning how to sit, roll over, and bark, COMPANION even learned how to do a cool new magic trick.",
      "Wow! COMPANION learned a ton of tricks today! They even can communicate totally in sign-language while rubbing their stomach and patting their head."],
     ["playing dress-up",
      "Oh no! SOOSH commented that COMPANION's makeup looked like it was applied with a Slippery Sammy.",
      "Looks like COMPANION is getting the hang of it. Their makeup is a bit messy, but the two of them had a lot of fun trying on different clothes.",
      "They had a lot of fun, and both their makeup and outfits turned out lovely! The two of them are ready for a night on the town.",
      "Wow! The two of them look like born super models. Maybe they'll appear on the cover of Kyootie Soosh Quarterly together!"]
];

function rollDie(dieSize) {
  return Math.floor((Math.random() * dieSize) + 1);
}

function modifiedRollDie(dieSize) {
  return Math.floor((Math.random() * dieSize) + 1) + successModifier + addSkillBoost(skillBoost);
}

function rollDaily() {
    $("#dailyOutput").text("Loading...\n\n\n");
    sooshName = $("#sooshName").val();
    if (allSooshNames.indexOf(sooshName) <= -1) {
        $("#sooshNameError").slideDown();
        return;
    }

    dailyType = $("#dailyType option:selected").text();
    locationType = $("#locationType option:selected").text();
    sooshName = sooshName.split(" :: ")[1]; // strip the USERNAME :: from infront of the name
    successModifier = parseInt($("#inventoryBuff>.activeBtn").text());
    skillBoost = 0;

    var currSooshSpreadsheet = sooshARPGDirectory({sooshName:sooshName}).select("spreadsheetURL")[0];
    if ((currSooshSpreadsheet != "x") && (dailyType != "Crafting")) {
        Tabletop.init( {
            key: currSooshSpreadsheet,
            callback: fetchSooshInfo
        } );
    } else {
        finalRollDaily();
    }
}

function fetchSooshInfo(data, tabletop) {
    var currSooshStats = tabletop.sheets("Stats");
    for (i=0; i<currSooshStats.elements.length; i++) {
        if (currSooshStats.elements[i].key == (dailyType + " EXP")) {
            skillBoost = getCurrentLevel(currSooshStats.elements[i].value);
            finalRollDaily();
            return;
        }
    }
    finalRollDaily();
    return;
}

function getCurrentLevel(lifeskillexp) {
    var finalid = 99;
    var expDiff = 0;
    statExpLevels().each(function (expLvl) {
        if (((lifeskillexp - expLvl.runningTotalExp) < expLvl.exp) && (finalid == 99)) {
            finalid = expLvl.id;
            expDiff = lifeskillexp - expLvl.runningTotalExp;
        }
    });
    return finalid-1;
}

function addSkillBoost(sBoost) {
    var newSkillBoost = sBoost - 1;
    if (newSkillBoost > 0) {
        return newSkillBoost;
    } else {
        return 0;
    }
}

function finalRollDaily() {
    dieRoll = modifiedRollDie(20);
    console.log("d20: " + dieRoll);
    if (dailyType == "Crafting") {
        if (dieRoll==1)
            dailyRollStr = "CRAFTING: results in a failure and a negative debuff";
        else if ((dieRoll>=2) && (dieRoll<=8))
            dailyRollStr = "CRAFTING: straight failure";
        else if ((dieRoll>=9) && (dieRoll<=12))
            dailyRollStr = "CRAFTING: failure but creates a new item";
        else if ((dieRoll>=13) && (dieRoll<=19))
            dailyRollStr = "CRAFTING: success";
        else if (dieRoll>=20)
            dailyRollStr = "CRAFTING: success + a buff for the next time they create an item";
        $("#dailyOutput").text(dailyRollStr);
    } else if ((dailyType == "Hunting") || (dailyType == "Angling")) {
        if (dieRoll==1)
            printDailyRollResult(false,true,"","","");
        else if ((dieRoll>=2) && (dieRoll<=6))
            printDailyRollResult(false,false,"","","");
        else if ((dieRoll>=7) && (dieRoll<=12))
            printDailyRollResult(true,false,1,"Common",[dailyType]);
        else if ((dieRoll>=13) && (dieRoll<=16))
            printDailyRollResult(true,false,1,"Uncommon",[dailyType]);
        else if ((dieRoll>=17) && (dieRoll<=19))
            printDailyRollResult(true,false,1,"Rare",[dailyType]);
        else if (dieRoll>=20)
            printDailyRollResult(true,true,1,"Rare",[dailyType]);
    } else if ((dailyType == "Mining") || (dailyType == "Wood-Cutting")) {
        if (dieRoll==1)
            printDailyRollResult(false,true,"","","");
        else if ((dieRoll>=2) && (dieRoll<=6))
            printDailyRollResult(false,false,"","","");
        else if ((dieRoll>=7) && (dieRoll<=12))
            printDailyRollResult(true,false,getRockWoodGatheringQuantity(),"Common",[dailyType]);
        else if ((dieRoll>=13) && (dieRoll<=16))
            printDailyRollResult(true,false,getRockWoodGatheringQuantity(),"Uncommon",[dailyType]);
        else if ((dieRoll>=17) && (dieRoll<=19))
            printDailyRollResult(true,false,getRockWoodGatheringQuantity(),"Rare",[dailyType]);
        else if (dieRoll>=20)
            printDailyRollResult(true,true,getRockWoodGatheringQuantity(),"Rare",[dailyType]);
    } else if (dailyType == "Gathering") {
        if (dieRoll==1)
            printDailyRollResult(false,true,"","","");
        else if ((dieRoll>=2) && (dieRoll<=6))
            printDailyRollResult(false,false,"","","");
        else if ((dieRoll>=7) && (dieRoll<=12))
            printDailyRollResult(true, false, getRockWoodGatheringQuantity(), "Common", getGatheringCategory());
        else if ((dieRoll>=13) && (dieRoll<=16))
            printDailyRollResult(true, false, getRockWoodGatheringQuantity(), "Uncommon", getGatheringCategory());
        else if ((dieRoll>=17) && (dieRoll<=19))
            printDailyRollResult(true, false, getRockWoodGatheringQuantity(), "Rare", getGatheringCategory());
        else if (dieRoll>=20)
            printDailyRollResult(true, true, getRockWoodGatheringQuantity(), "Rare", getGatheringCategory());
    } else if (dailyType == "Cooking") {
        dailyRollStr = "<sub>" + sooshName + " tried their hand at cooking ITEM.\n";
        if (dieRoll==1)
            dailyRollStr += "They tried tasting their food and had to immediately spit it out. Oh no! Looks like it got burnt in the cooking process.\nUnfortunately they received the NEGATIVE STATUS.";
        else if ((dieRoll>=2) && (dieRoll<=6))
            dailyRollStr += "Looks like they left it on the stove for too long and burnt it. Better luck next time!";
        else if ((dieRoll>=7) && (dieRoll<=11))
            dailyRollStr += "It turned out super delicious! In fact, it was so good, your soosh couldn't help themselves and ate the whole thing!\nThey are awarded XX exp.";
        else if ((dieRoll>=12) && (dieRoll<=19))
            dailyRollStr += "It turned out super delicious! Good thing they made a big batch or they might have eaten it all.\nThey managed to cook ITEM.\nThey are awarded XX exp.";
        else if (dieRoll>=20)
            dailyRollStr += "They cooked up a storm today! With so much delicious food, this is a cause for celebration!\nThey managed to cook ITEM.\nThey are awarded XX exp.\nThey also received the POSITIVE STATUS.";
        $("#dailyOutput").text(dailyRollStr);
    } else if (dailyType == "Companion Handling") {
        currCHCase = companionHandlingCases[Math.floor(Math.random()*companionHandlingCases.length)];
        dailyRollStr = "<sub>" + sooshName + " tried their hand at companion handling with COMPANION. They decided to try " + currCHCase[0] + ".\n";
        if (dieRoll==1)
            dailyRollStr += currCHCase[1] + " Hopefully COMPANION isn't too hurt and angry.\nUnfortunately, they received the NEGATIVE STATUS and lost -20 friendliness exp.";
        else if ((dieRoll>=2) && (dieRoll<=6))
            dailyRollStr += "Looks like COMPANION isn't listening to SOOSH right now. Maybe they're annoyed?\nUnfortunately, they lost -10 friendliness exp.";
        else if ((dieRoll>=7) && (dieRoll<=11))
            dailyRollStr += currCHCase[2] + "\nThey earned +10 handler exp. and +10 friendliness exp.";
        else if ((dieRoll>=12) && (dieRoll<=19))
            dailyRollStr += currCHCase[3] + "\nThey earned +20 handler exp. and +20 friendliness exp.";
        else if (dieRoll>=20)
            dailyRollStr += currCHCase[4] + "\nThey earned +30 handler exp. and +30 friendliness exp.";
        $("#dailyOutput").text(dailyRollStr);
    }
}

function getRockWoodGatheringQuantity() {
    dieRoll = modifiedRollDie(20);
    switch (true) {
        case dieRoll>=1 && dieRoll<=5:
            return 1;
        case dieRoll>=6 && dieRoll<=10:
            return 2;
        case dieRoll>=11 && dieRoll<=15:
            return 3;
        case dieRoll>=16 && dieRoll<=19:
            return 4;
        case dieRoll>=20:
            return 5;
    }
}

function getGatheringCategory() {
    var options = [["Flower","Plant","Root"], ["Small Animal Items/Drops"],["Fruit","Vegetable","Berry"],["Crafting Item"],["Miscellaneous"],["Treasure"]];
    return options[rollDie(6)-1];
}

function getItems(currRarity, categories) {
    var allChoices = [];
    for (i=0; i<categories.length; i++) {
        allChoices = allChoices.concat(allItems({type:categories[i],rarity:currRarity,location:locationType}).select("name"));
    }
    // remove BEES
    var beeIndex = allChoices.indexOf("BEES");
    if (beeIndex > -1) {
        allChoices.splice(beeIndex, 1);
    }
    console.log(allChoices);
    return allChoices;
}

function printDailyRollResult(success, buffCase, quantity, rarity, categories) {
    var finalResult = "<sub>" + sooshName + " went " + dailyType + " in " + locationType + ".";
    if (success) {
        var currItems = getItems(rarity, categories);
        if (currItems.length == 0) {
            finalResult += "\nUnfortunately they didn’t find anything, maybe next time!\n\n";
        } else {
            finalResult += "\nThey managed to find " + quantity + " " + currItems[Math.floor(Math.random() * currItems.length)] + "!";
            finalResult += "\nThey are awarded ";
            switch (true) {
                case rarity=="Common":
                    finalResult += "10";
                    break;
                case rarity=="Uncommon":
                    finalResult += "15";
                    break;
                case rarity=="Rare":
                    finalResult += "25";
                    break;
            }
            finalResult += " " + dailyType.toLowerCase() + " exp.";
            if (buffCase) {
                finalResult += "\nThey also received the <b>Lucky Duck Status Infliction</b>! They will gain +1 to their daily roll tomorrow.</small>";
            }
        }
    } else if (!success && buffCase) {
        finalResult += "\nUnfortunately they didn’t find anything and you got a debuff\n\n";
    } else if (!success) {
        finalResult += "\nUnfortunately they didn’t find anything, maybe next time!\n\n";
    }
    $("#dailyOutput").text(finalResult);
}
