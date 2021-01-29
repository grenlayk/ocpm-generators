const U = 0; // up
const R = 1; // right
const D = 2; // down
const L = 3; // left

let graph = [];
let seq = [];
let finish = null;

class GVertex {
    constructor(id) {
        this.id = parseInt(id);
        this.edges = [];
    }

    addEdge(edge) {
        this.edges.push(edge);
    }
}

class GEdge {
    constructor(to, vdir, todir) {
        this.to = parseInt(to);
        this.vdir = parseInt(vdir);
        this.todir = parseInt(todir);
    }

    label() {
        return `${this.to}: ${this.vdir} - ${this.todir}`;
    }
}

function addEdges(v, to, d1, d2) {
    graph[v].addEdge(new GEdge(to, d1, d2));
    graph[to].addEdge(new GEdge(v, d2, d1));
}

function buildGraph() {
    graph = [];
    let total = 13;
    for (let i = 0; i < total; ++i) {
        graph.push(new GVertex(i));
    }
    // Edges list
    // Oh God, I just hope I haven't mistaken here
    addEdges(0, 1, R, L);
    addEdges(0, 4, D, U);
    addEdges(1, 3, U, D);
    addEdges(1, 2, R, L);
    addEdges(1, 5, D, R);
    addEdges(4, 5, R, U);
    addEdges(4, 5, D, L);
    addEdges(4, 7, L, U);
    addEdges(5, 9, D, U);
    addEdges(6, 7, R, L);
    addEdges(7, 8, R, U);
    addEdges(7, 8, D, L);
    addEdges(8, 9, R, L);
    addEdges(8, 10, D, R);
    addEdges(9, 11, D, U);
    addEdges(9, 12, R, U);
}


function getSequence() {
    let curd = 3;
    finish = 0;
    seq = [];
    for (let i = 0; i < 8; ++i) {
        let sz = graph[finish].edges.length;
        let id = getRandomInt(0, sz);
        let e = graph[finish].edges[id];
        seq.push((e.vdir - curd + 6) % 4);
        finish = e.to;
        curd = e.todir;
    }
    console.log(seq);
    console.log(finish);
}



