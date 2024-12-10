const http = require('http');
const url = require('url');

 
function converterData(data) {
    return new Date(data).getTime() / 1000;
}

async function consultarDadosPorAno(categoria) {
    const puppeteer = require('puppeteer-core');
    const fs = require('fs');
    var dados = [];
 
    (async () => {
        const browser = await puppeteer.launch({
            executablePath: 'C:/xampp/htdocs/dados/chrome-win/chrome.exe' 
        });
        const page = await browser.newPage();

        const anoAtual = new Date();

        for(var ano = 2020; ano <= anoAtual.getFullYear(); ano++) {
            var dataInicio = converterData(ano + "-01-01");
            var dataFinal = converterData(ano + "-12-31");

            if(categoria == "todos") {
                var url = 'https://incidentdatabase.ai/apps/discover/?epoch_incident_date_max=' + dataFinal + '&epoch_incident_date_min=' + dataInicio + '&hideDuplicates=1&is_incident_report=true';
            }
            else {
                var url = 'https://incidentdatabase.ai/apps/discover/?epoch_incident_date_max=' + dataFinal + '&epoch_incident_date_min=' + dataInicio + '&hideDuplicates=1&is_incident_report=true&s=' + categoria;
            }

            await page.goto(url, { waitUntil: 'networkidle2' });

            var tempo = 2000;

            if(ano == 2020) {
                tempo = 5000;
            }

            await page.evaluate((tempo) => {
                return new Promise(resolve => {
                    setTimeout(resolve, tempo);
                });
            }, tempo);

            const data = await page.evaluate(() => {
                const elements = document.querySelectorAll('.flex');
                let result = [];
                elements.forEach(element => result.push(element.textContent));
                return result;
            });
    
            var qtdDados = data[87].split(" ");
            qtdDados = qtdDados[0];
    
            dados.push({categoria: categoria, ano: ano, dados: qtdDados});
        }
 
        fs.writeFile('dados.json', JSON.stringify(dados, null, 2), err => {
            if(err) throw new Error('Algo deu errado!');
 
            console.log('Tudo certo!');
        });
 
        await browser.close();
    })();
   
    return "Sucesso!";
}
 
async function consultarDadosPorAnoMes(ano, categoria) {
    const puppeteer = require('puppeteer-core');
    const fs = require('fs');
    var dados = [];
 
    (async () => {
        const browser = await puppeteer.launch({
            executablePath: 'C:/xampp/htdocs/dados/chrome-win/chrome.exe' 
        });
        const page = await browser.newPage();
 
        for(var mes = 1; mes <= 12; mes++) {
           
            if(mes == 1 || mes == 3 || mes == 5 || mes == 7 || mes == 8 || mes == 10 || mes == 12) {
                var dataInicio = converterData(ano + "-" + mes + "-01");
                var dataFinal = converterData(ano + "-" + mes + "-31");
            }
            else if(mes == 2) {
                if(ano % 4 == 0) {
                    if(ano % 100 == 0) {
                        var dataInicio = converterData(ano + "-" + mes + "-01");
                        var dataFinal = converterData(ano + "-" + mes + "-28");
                    }
                    else {
                        var dataInicio = converterData(ano + "-" + mes + "-01");
                        var dataFinal = converterData(ano + "-" + mes + "-29");
                    }
                }
                else if(ano % 400 == 0) {
                    var dataInicio = converterData(ano + "-" + mes + "-01");
                    var dataFinal = converterData(ano + "-" + mes + "-29");
                }
                else {
                    var dataInicio = converterData(ano + "-" + mes + "-01");
                    var dataFinal = converterData(ano + "-" + mes + "-28");
                }
            }
            else {
                var dataInicio = converterData(ano + "-" + mes + "-01");
                var dataFinal = converterData(ano + "-" + mes + "-30");
            }
           
            if(categoria == "todos") {
                var url = 'https://incidentdatabase.ai/apps/discover/?epoch_incident_date_max=' + dataFinal + '&epoch_incident_date_min=' + dataInicio + '&hideDuplicates=1&is_incident_report=true';
            }
            else {
                var url = 'https://incidentdatabase.ai/apps/discover/?epoch_incident_date_max=' + dataFinal + '&epoch_incident_date_min=' + dataInicio + '&hideDuplicates=1&is_incident_report=true&s=' + categoria;
            }
   
            await page.goto(url, { waitUntil: 'networkidle2' });
 
            var tempo = 2000;

            await page.evaluate((tempo) => {
                return new Promise(resolve => {
                    setTimeout(resolve, tempo);
                });
            }, tempo);

            const data = await page.evaluate(() => {
                const elements = document.querySelectorAll('.flex');
                let result = [];
                elements.forEach(element => result.push(element.textContent));
                return result;
            });
   
            var qtdDados = data[87].split(" ");
            qtdDados = qtdDados[0];
   
            dados.push({categoria: categoria, ano: ano, mes: mes, dados: qtdDados});
        }
 
 
        fs.writeFile('dados.json', JSON.stringify(dados, null, 2), err => {
            if(err) throw new Error('Algo deu errado!');
 
            console.log('Tudo certo!');
        });
 
        await browser.close();
 
    })();
   
    return "Sucesso!";
 
}
 
const server = http.createServer(async (req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;
    const query = parsedUrl.query;
 
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
 
    if (req.method === 'GET' && pathname === '/consultar-dados') {
        const { ano, categoria } = query;

        if(ano == 'todos') {
            var resultado = await consultarDadosPorAno(categoria);
        }
        else {
            var resultado = await consultarDadosPorAnoMes(ano, categoria);
        }

        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end(resultado);
    } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Rota não encontrada');
    }
});
 
server.listen(4000, () => {
    console.log('Servidor rodando em http://localhost:4000');
});