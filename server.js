const fastify = require('fastify')({ logger: true });
const path = require('node:path');
const fs = require('node:fs');

const fileStorePath = path.join(__dirname, 'public', 'compare.json');

fastify.register(require('@fastify/formbody'));
fastify.register(require('@fastify/static'), {
    root: path.join(__dirname, 'public'),
});


function getComparePlayers() {
    const text = fs.readFileSync(fileStorePath);
    return JSON.parse(text);
}

function writeComparePlayers(players) {
    const text = JSON.stringify(players, null, 4);
    fs.writeFileSync(fileStorePath, text);
}

fastify.get('/compare', async (request, reply) => {
    reply.send(getComparePlayers());
});

fastify.post('/compare', async (request, reply) => {
    const player = request.body;
    const players = getComparePlayers();

    if (players.find(p => p.Player === player.Player)) {
        reply.send({ success: false, message: 'Already added' });
        return;
    }

    players.push(player);
    writeComparePlayers(players);

    reply.send({ success: true, player });
});

fastify.delete('/compare/:name', async (request, reply) => {
    const { name } = request.params;

    let players = getComparePlayers();
    players = players.filter(p => p.Player !== name);

    writeComparePlayers(players);

    reply.send({ success: true });
});


const start = async () => {
    try {
        await fastify.listen({ port: 3000 });
        console.log('Server running at http://localhost:3000');
    } catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
};

start();
