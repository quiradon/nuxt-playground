    //verifica se tem algum caractere que não deve
    const dicePattern = /^[+-]?(?:\([+-]?)*(?:(?:\d*d\d*(?:(?:km(?![^d]*(?:e|km))|k(?![^d]*(?:e|k(?:[^m]|$)))|ei(?![^d]*(?:ei|k))|e(?![^d]*(?:e(?:[^i]|$)|k))|(([<>])\2)(?![^d]*\1)|([+\-*\/%])\3)\d*)*|\d+|f\d*)\)*(?:$|[+\-*\/%](?=[\ddf(]))(?:\([+-]?)*)+$/i
    
    //encontra dados
    const diceFinderPattern = /[\ddf](\s*(?:[\ddkeim<>]|[+\-*\/%]{2}))*/ig;
    const hasDices = /[df]/i;
    //exemplo: 5d20e20k10

    function rollRaw(rollsBruto) {
        //verifique se rollsBruto é um dado valido
        if (!dicePattern.test(rollsBruto)) {
            return {"error": "Invalid dice"};
        }

        try {
            //encontra o que está antes de d (5d)
            function getAmount(dice) {
                const output = dice.match(/\d*d/ig);
                if (output === null)
                    return -1;
    
                if (output[0].length > 1) {
                    return - -output[0].substring(0, output[0].length - 1);
                } else {
                    return 1;
                }
            }
            //encontra o que está depois de d (d20)
            function getD(dice) {
                const output = dice.match(/d\d*/ig);
                if (output[0].length > 1) {
                    return - -output[0].substring(1);
                } else {
                    return 20;
                }
            }
            //encontra o que está depois de e (e20)
            function getE(dice, faceAmount) {
                let output = dice.match(/ei?\d*/ig);
                if (output === null) {
                    return {value: 0, isIndefinite : false};
                }
    
                let replaced = output[0].replace(/^e/i, "");
                const isIndefinite = /^i/i.test(replaced[0]);
                if (isIndefinite) {
                    replaced = replaced.replace(/^i/i, "");
                }
    
                if (replaced === "") {
                    replaced = faceAmount;
                } else if (replaced > faceAmount || replaced <= 1) {
                    return undefined;
                }
    
                return {value: - -replaced, isIndefinite : isIndefinite};
            } 
            //encontra o que está depois de k (k10)
            function getK(dice, rollAmount) {
                let outputs = dice.match(/km?\d*/ig);
    
                if (outputs === null) {
                    return {
                        max: rollAmount,
                        min: 0
                    };
                }
    
                let replaced = {
                    max : 0,
                    min : 0
                };
                for (let output of Object.values(outputs)) {
                    output = output.substring(1);
                    if (output[0] === "m")
                        replaced.min = parseInt(output.substring(1) || 1);
                    else
                        replaced.max = parseInt(output || 1);
                }
                return (replaced.min + replaced.max > rollAmount) ? undefined : replaced;
            }
    
    
            //encontra o que está depois de f (f4)
            function getF(dice) {
                let outputs = dice.match(/f\d*/ig);
                
                if (outputs === null) {
                    return undefined;
                }
    
                let replaced = 4;
                for (let output of Object.values(outputs)) {
                    output = output.substring(1);
                    if (output !== "") {
                        replaced = parseInt(output)
                    }
                }
                return replaced;
            }
    
            function getLessMoreThan(dice, faceAmount) {
                let outputs = dice.match(/([<>])\1\d*/ig);
                let replaced = {
                    lessThanOrEqualTo: Infinity,
                    moreThanOrEqualTo: -Infinity
                };
                
                if (outputs === null) {
                    return replaced;
                }
                
                for (let output of Object.values(outputs)) {
                    if (output[0] === ">")
                        replaced.moreThanOrEqualTo = parseInt(output.substring(2) || faceAmount * 0.5);
                    else
                        replaced.lessThanOrEqualTo = parseInt(output.substring(2) || faceAmount * 0.5);
                }
                return replaced;
            }
    
            function getArbitraryOperands(dice) {
                let matches = dice.match(/[+\-*/%]{2}\d*/ig);
                if (matches == null)
                    return []
    
                let output = [];
                for (const match of matches) {
                    switch (match[0]) {
                        case "+":
                            output.push(
                                {
                                    type : "+",
                                    func : (x, y) => x + y,
                                    value : parseInt(match.substring(2) || 1)
                                }
                            )
                            break;
                        case "-":
                            output.push(
                                {
                                    type : "-",
                                    func : (x, y) => x - y,
                                    value : parseInt(match.substring(2) || 1)
                                }
                            )
                            break;
                        case "*":
                            output.push(
                                {
                                    type : "*",
                                    func : (x, y) => x * y,
                                    value : parseInt(match.substring(2) || 2)
                                }
                            )
                            break;
                        case "/":
                            output.push(
                                {
                                    type : "/",
                                    func : (x, y) => x / y,
                                    value : parseInt(match.substring(2) || 2)
                                }
                            )
                            break;
                        case "%":
                            output.push(
                                {
                                    type : "%",
                                    func : (x, y) => x % y,
                                    value : parseInt(match.substring(2) || 10)
                                }
                            )
                            break;
                    }
                }
                return output;
            }
                
            const rollsWithoutSpaces = rollsBruto.replace(/\s/gm, "");
            if (!dicePattern.test(rollsWithoutSpaces)) {
                return "catch";
            }
            
            if (rollsWithoutSpaces.length > 200) {
                return "too_many_characters";
            }
            else if (!hasDices.test(rollsWithoutSpaces)) {
                let totalCalculusNumber = eval(rollsWithoutSpaces);
    
                if (totalCalculusNumber == Infinity || totalCalculusNumber == -Infinity) {
                    totalCalculusNumber = 'translation.errorDivisionByZero;'
                } else if (isNaN(totalCalculusNumber)) {
                    totalCalculusNumber = 'translation.errorIndefinition;'
                } else {
                    totalCalculusNumber = parseFloat(totalCalculusNumber.toFixed(2)).toString();
                }
                let calculusString = rollsBruto;
                if (rollsBruto.length > 1001 - totalCalculusNumber.length) {
                    calculusString = 'translation.errorIndefinition;'
                }
    
                return {
                    output: totalCalculusNumber, 
                    rollString: calculusString, 
                };
            }
            
            //separa todos os dados apenas
            const rolls = rollsWithoutSpaces.match(diceFinderPattern);
    
            var totalRollCount = 0;
    
            //todos os valores rodados pelos dados em ordem
            var allRollsString = [];
            //assim como a anterior, mas pega os valores numéricos
            var allRolls = [];
    
            var totalExplosionCount = 0;
    
            //itera por todos os dados
            for (let i = 0; i < rolls.length; i++) {
                if (rolls[i] == "") {
                    continue;
                }
    
                //adiciona uma string do roll na lista para ser editada
                allRollsString.push("");
                let canceled = false;
                const fateDice = getF(rolls[i])
                if (typeof fateDice !== "undefined") {
                    if (fateDice > 0) {
                        const emojis = {
                            "-1": "➖",
                            "0": "⭕",
                            "1": "➕"
                        }
                        const numbersRolledString = []
                        const numI = allRolls.push(0) - 1
                        
                        for (let j = 0; j < fateDice; j++) {
                            const fateRoll = Math.floor(Math.random() * 3 - 1)
                            numbersRolledString.push(emojis[fateRoll])
                            allRolls[numI] += fateRoll
                        }
    
                        allRollsString[i] = "{" + numbersRolledString.join(" ") + "}"
                    }
                    continue
                }
                //#region Obter valores do dado
                const diceAmount = getAmount(rolls[i]);
                
                if (diceAmount === -1) {
                    //se for só um número, só adiciona o número ae
                    allRolls.push(- -rolls[i]);
                    //agora soma na string tbm pq é
                    allRollsString[i] += rolls[i];
                    if (isNaN(allRolls[i]) || allRolls[i] === undefined) {
                        return "catch";
                    }
                    continue;
                } else if (isNaN(diceAmount)) {
                    return "catch";
                }
                
                const faceAmount = getD(rolls[i]);
                
                if (isNaN(faceAmount)) {
                    return "catch";
                } else if (faceAmount > 1000) {
                    return {"error": "Face amount too high (max 1000)"};
                } else if (faceAmount < 1) {
                    return "non_natural_faces";
                }
                
                const explosionNumber = getE(rolls[i], faceAmount);
                
                if (explosionNumber === undefined) {
                    return '{kabum}';
                }
    
                const keepNumber = getK(rolls[i], diceAmount);
                
                if (keepNumber === undefined) {
                    return 'catch';
                }
                const absKeepNumber = keepNumber.min + keepNumber.max;
                //se o maluco literalmente mandou um keep 0:
                if (absKeepNumber === 0) {
                    allRollsString[i] += "\u001b[0;31m"; // \u001b[{bold};{red}m
                    canceled = true;
                }
                const keepIf = getLessMoreThan(rolls[i], faceAmount);
                let diceAmountInLessGreaterRange = diceAmount;
    
                const arbitraryOperands = getArbitraryOperands(rolls[i])
                //#endregion
                
                totalRollCount += diceAmount;
                if (totalRollCount > 1000) {
                    return "dice_limit";
                }
                //inicializa a string principal para o roll atual
                allRollsString[i] += "{";
    
                //variável contendo todos os números (em formato de int ou string caso necessário, como "💥16" ou "[5]")
                let numbersRolled = [];
                //apenas os números que serão mantidos na soma, todos em formato de int
                let numbersKept = absKeepNumber === diceAmount ? [] : {
                    min : [],
                    max : []
                };
                //os índices dos números acima na array numbersRolled
                let numbersKeptIndexes = {
                    min : [],
                    max : []
                };
                
                //valores usados para k e km.
                //maxDoMin significa o valor máximo que tem na seleção km do dado
                //minDoMax significa o valor mínimo que tem na seleção k do dado
                let arrMinMax = {
                    maxDoMin: {
                        value: -Infinity,
                        index: -1
                    },
                    minDoMax: {
                        value: Infinity,
                        index: -1
                    }
                };
                //valores duplicados nas listas de k e km (no fim será vazia, mas durante a execução será usado)
                let duplicates = {};
                //verifica os operadores >> e << (está aqui por questões de escopo)
                function checkIfInNumberRange(numberRolled) {
                    if (numberRolled > keepIf.lessThanOrEqualTo || numberRolled < keepIf.moreThanOrEqualTo) {
                        numbersRolled[numbersRolled.length - 1] = `\u001b[0;31m${numbersRolled[numbersRolled.length - 1].substring(7)}\u001b[0m`;
                        diceAmountInLessGreaterRange--;
                        if (absKeepNumber >= diceAmountInLessGreaterRange && numbersKept.length === undefined) {
                            numbersKept = [];
                            for (const number of numbersRolled) {
                                if (typeof number === "number")
                                    numbersKept.push(number);
                            }
                        }
                        return false;
                    }
                    return true;
                }
    
                for (let j = 0; j < diceAmount; j++) {
                    //console.log(`j = ${j}`)
                    //console.log(numbersRolled)
                    //número rolado do dado
                    let numberRolled = Math.floor(Math.random() * faceAmount + 1);
                    
                    //operadores de dados em massa
                    numberRolled = operands(arbitraryOperands, numbersRolled, numberRolled);
    
                    //se o maluco mandar um keep 0, ignore tudo a frente:
                    if (canceled) {
                        continue;
                    }
    
                    //chama a função que verifica as explosões (operadores e e ei)
                    var funcReturn = explosions(explosionNumber, numberRolled, numbersRolled, numbersKept, checkIfInNumberRange, totalExplosionCount, faceAmount);
                    
                    //tipo string = erro
                    if (typeof funcReturn === "string") {
                        return funcReturn;
                    }
    
                    //tipo objeto = explodiu, ignore keep
                    else if (typeof funcReturn === "object") {
                        totalExplosionCount = funcReturn.totalExplosionCount;
                        continue;
                    }
    
                    //se tiver fora do range, só vai embora, o keep não te quer
                    else if (!checkIfInNumberRange(numberRolled)) {
                        continue;
                    }
    
                    //tipo bool, significa que não é um explosion dice, vamo ver se é keep (operadores k e km)
                    const isKeep = keep(checkIfInNumberRange, absKeepNumber, diceAmountInLessGreaterRange, keepNumber, numbersKept, numbersKeptIndexes, arrMinMax, numberRolled, numbersRolled, duplicates, j);
    
                    //true se executou, false se não. se executou, passa pro próximo
                    if (isKeep) {
                        continue;
                    }
    
                    //se depois de tudo isso, o for ainda não tomou continue, só adiciona normal pq é um dado normal
                    numbersKept.push(numberRolled);
                }
                //adiciona os números que eu rolei nesse conjunto de dado à string principal
                allRollsString[i] += numbersRolled.join(', ') + "}";
    
                allRolls.push(0);
                if (!canceled) {
                    for (const numbersToSum of numbersKept.length !== undefined ? numbersKept : numbersKept.min.concat(numbersKept.max)) {
                        allRolls[i] += numbersToSum;
                    }
                }
                else {
                    allRollsString[i] += ""; // \u001b[{normal};{white}m
                }
                if (isNaN(allRolls[i]) || allRolls[i] === undefined) {
                    return "catch";
                }
            }
            
            let i = -1;
            //coloca bonitinho os rolls do embed
            let rollString = rollsBruto.replace(diceFinderPattern, function(x) {
                i++;
                return allRollsString[i];
            });
            i = -1;
    
            const totalRollNumberAsString = rollsWithoutSpaces.replace(diceFinderPattern, function(x) {
                i++;
                return allRolls[i];
            });
    
            let totalRollNumber = eval(totalRollNumberAsString);
            
            //seta os valores especiais, pra caso o engraçadinho faça algo que nem sequer dê um número
            if (totalRollNumber == Infinity) {
                totalRollNumber = 'translation.errorInf;'
            } else if (totalRollNumber == -Infinity) {
                totalRollNumber = 'translation.errorMinusInf;'
            } else if (isNaN(totalRollNumber)) {
                totalRollNumber = 'translation.errorIndefinition;'
            } else {
                totalRollNumber = parseFloat(totalRollNumber.toFixed(2)).toString();
            }
    
            //muitos dados = mais de 1024 caracteres no embed, o que quebra ele se eu tentar colocar tudo
            //retorna tudo bunitin
            return {
                output: totalRollNumber, 
                rollString: rollString, 
            };
        }
        //oh no, erro no código
        catch (e) {
            return "Erro desconhecido";
        }
    }
    
    //dado explosivo
    function explosions(explosionNumber, numberRolled, numbersRolled, numbersKept, checkIfInNumberRange, totalExplosionCount, faceAmount) {
        //se não for dado explosivo, ou o número rolado for menor que deveria, ignora todo o resto
        if (explosionNumber.value === 0 || numberRolled < explosionNumber.value) {
            return false;
        }
        checkIfInNumberRange(numberRolled);
        
        //se explodiu, guarde aqui o valor dessa explosão
        let newRoll = Math.ceil(Math.random() * faceAmount);
        //e adicione na array de números
        numbersKept.push(newRoll);
        numbersRolled.push(`💥${newRoll}`);
        //e some o total de explosões
        totalExplosionCount++;
    
        //se passar das 1000, retorna um erro
        if (totalExplosionCount > 1000) {
            return "too_many_explosions";
        }
    
        //verifica se o novo valor da explosão tá no range
        checkIfInNumberRange(newRoll);
        
        //e se o dado não for do tipo ei, já retorna
        if (!explosionNumber.isIndefinite) {
            return {
                totalExplosionCount : totalExplosionCount,
                numbersKept : numbersKept,
                numbersRolled : numbersRolled
            };
        }
    
        //se for, enquanto o novo dado puder continuar indo, vai
        while (newRoll >= explosionNumber.value) {
            newRoll = Math.floor(Math.random() * faceAmount + 1);
            
            //adiciona o novo rolls
            numbersKept.push(newRoll);
            numbersRolled.push(`💥${newRoll}`);
            
            //soma no total
            totalExplosionCount++;
            //e se for maior que 1000, retorna o erro
            if (totalExplosionCount > 1000) {
                return "too_many_explosions";
            }
    
            //esse novo roll tá no range?
            checkIfInNumberRange(newRoll);
        }
    
        //retorna os espólios do while
        return {
            totalExplosionCount : totalExplosionCount,
            numbersKept : numbersKept,
            numbersRolled : numbersRolled
        };
    }
    
    //dado keep
    function keep(checkIfInNumberRange, absKeepNumber, diceAmountInLessGreaterRange, keepNumber, numbersKept, numbersKeptIndexes, arrMinMax, numberRolled, numbersRolled, duplicates, j) {
        //se a quantidade de números a manter for maior ou igual a quantia no range, ignora tudo
        //por padrão, se k não for especificado, k = quantidade de dados, ou seja, maior ou igual os dados no range
        if (absKeepNumber >= diceAmountInLessGreaterRange) {
            return false;
        }
    
        //console.log(numbersRolled)
    
        //esta variável indica se o número já foi adicionado na lista dos min, para que os dois códigos saibam onde devem se desentrelaçar
        let gotBetterNumber = false;
        //se foi usado km:
        if (keepNumber.min !== 0) {
            //encha a lista dos km (ou seja, selecione os dois primeiros em um km2)
            if (numbersKept.min.length < keepNumber.min) {
                gotBetterNumber = true;
                
                numbersKept.min.push(numberRolled);
                numbersKeptIndexes.min.push(j);
                //o número rolado, é maior que o máximo dos dados km?
                if (numberRolled >= arrMinMax.maxDoMin.value) {
                    //se for, salve o valor atual como novo máximo dos km
                    arrMinMax.maxDoMin.value = numberRolled;
                    arrMinMax.maxDoMin.index = numbersKept.min.length - 1;
                }
            }
            //se já tiver enchido, verifica se o meu novo é uma rolagem melhor do que a pior das que eu tenho
            //ou seja, se ele é menor ou igual que o maior valor entre os km
            //eu coloquei menor ou igual para que não haja conflitos entre k e km
            //dessa forma, caso hajam duplicatas, o min escolherá os da direita, e o max os da esquerda
            else if (numberRolled <= arrMinMax.maxDoMin.value) {
                gotBetterNumber = true;
                
                let newNumIndex = arrMinMax.maxDoMin.index;
                
                numbersKept.min[newNumIndex] = numberRolled;
                if (duplicates[numbersKeptIndexes.min[newNumIndex]]) {
                    delete duplicates[numbersKeptIndexes.min[newNumIndex]];
                }
                else {
                    //console.log(numbersRolled[numbersKeptIndexes.min[newNumIndex]])
                    numbersRolled[numbersKeptIndexes.min[newNumIndex]] = `${numbersRolled[numbersKeptIndexes.min[newNumIndex]].substring(7)}`;
                }
                numbersKeptIndexes.min[newNumIndex] = j;
                
                //procure pelo novo maior valor, este será o próximo a ser removido caso um menor ou igual a ele apareça
                arrMinMax.maxDoMin.value = Math.max(...numbersKept.min);
                arrMinMax.maxDoMin.index = numbersKept.min.indexOf(arrMinMax.maxDoMin.value);
            }
        }
        //se foi usado k:
        if (keepNumber.max !== 0) {
            //encha a lista dos k (ou seja, selecione os três primeiros em um k3)
            if (numbersKept.max.length < keepNumber.max) {
                if (gotBetterNumber) {
                    //opa, duplicata!
                    duplicates[j] = numberRolled;
                }
                else {
                    gotBetterNumber = true;
                }
                
                numbersKept.max.push(numberRolled);
                numbersKeptIndexes.max.push(j);
                //se for um número menor que o menor valor da lista, esse é nosso novo pior, ou seja, nosso primeiro a ser substituído no caso de um melhor
                if (numberRolled < arrMinMax.minDoMax.value) {
                    arrMinMax.minDoMax.value = numberRolled;
                    arrMinMax.minDoMax.index = numbersKept.max.length - 1;
                }
            }
            //se já tiver enchido, verifica se o meu novo é uma rolagem melhor do que a pior que eu tenho
            //ou seja, se ele é maior que o menor valor entre os k
            //eu coloquei menor ou igual para que não haja conflitos entre k e km
            //dessa forma, caso hajam duplicatas, o min escolherá os da direita, e o max os da esquerda
            else if (numberRolled > arrMinMax.minDoMax.value) {
                
                if (gotBetterNumber) {
                    //opa, duplicata!
                    duplicates[j] = numberRolled;
                }
                else {
                    gotBetterNumber = true;
                }
                newNumIndex = arrMinMax.minDoMax.index;
                
                numbersKept.max[newNumIndex] = numberRolled;
                if (duplicates[numbersKeptIndexes.max[newNumIndex]]) {
                    delete duplicates[numbersKeptIndexes.max[newNumIndex]];
                }
                else {
                    numbersRolled[numbersKeptIndexes.max[newNumIndex]] = `\u001b[0;31m${numbersRolled[numbersKeptIndexes.max[newNumIndex]].substring(7)}`;
                }
                numbersKeptIndexes.max[newNumIndex] = j;
            
                //verifica o novo menor da lista do k, ou seja, o pior valor da lista k e o próximo a ser removido
                arrMinMax.minDoMax.value = Math.min(...numbersKept.max);
                arrMinMax.minDoMax.index = numbersKept.max.indexOf(arrMinMax.minDoMax.value);
            }
        }
        //se nenhum deles quis o número...
        if (!gotBetterNumber) {
            //descarte de cara
            numbersRolled[j] = `${numbersRolled[j].substring(7)}`;
        }
    
        return true;
    }
    
    //operadores arbitrários
    function operands(arbitraryOperands, numbersRolled, numberRolled) {
        //se não tiver operando especial nenhum, só retorna o que ele é
        if (arbitraryOperands.length == 0) {
            numbersRolled.push(`${numberRolled}`);
            return numberRolled;
        }
        //se tiver, calcule-os e coloque bonitinho escrito como (5+3*4=32). e sim, eu sei que tá errado, mas nosso bot tem a regra left-associative.
        const numbersRolledIndex = numbersRolled.length;
        numbersRolled.push("(" + numberRolled);
    
        //itera porisso todos os operadores...
        for (const operand of arbitraryOperands) {
            //faz a operação
            numberRolled = operand.func(numberRolled, operand.value);
            //e arruma na string
            numbersRolled[numbersRolledIndex] += operand.type + operand.value;
        }
        //arruma o finalzinho da string
        numbersRolled[numbersRolledIndex] += `=${numberRolled})\u001b[0m`;
        //e retorna o número arrumado
        return numberRolled;
    }
    
    export default defineEventHandler((event) => {
        const query = getQuery(event)
        return rollRaw(query.dice)
      })
