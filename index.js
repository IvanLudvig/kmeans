const svgContainer = document.getElementById('container');
const pointsNumInput = document.getElementById('points-input');
const clustersNumInput = document.getElementById('clusters-input');
const stopBtn = document.getElementById('stop-btn');
const restartBtn = document.getElementById('restart-btn');

let numPoints = parseInt(pointsNumInput.value);
let numClusters = parseInt(clustersNumInput.value);

pointsNumInput.addEventListener('input', (ev) => {
    if (parseInt(ev.target.value) !== numPoints) {
        numPoints = parseInt(ev.target.value);
        reset();
    }
});

clustersNumInput.addEventListener('input', (ev) => {
    if (parseInt(ev.target.value) !== numClusters) {
        numClusters = parseInt(ev.target.value);
        reset();
    }
});

stopBtn.addEventListener('click', (ev) => {
    if (interval) {
        stop();
        stopBtn.innerText = 'Start';
    } else {
        start();
        stopBtn.innerText = 'Stop';
    }

});

restartBtn.addEventListener('click', (ev) => {
    reset();
});

const margin = { top: 10, right: 60, bottom: 20, left: 20 };

let viewBox = { x: 0, y: 0, w: 1000, h: 600 };
const width = viewBox.w - margin.left - margin.right;
const height = viewBox.h - margin.top - margin.bottom;

document.body.style.background = '#1e1e1e';

const svg = d3.select('#container')
    .append('svg')
    .attr('viewBox', `${viewBox.x} ${viewBox.y} ${viewBox.w} ${viewBox.h}`)
    .attr('width', window.innerWidth - margin.left - margin.right)
    .attr('height', window.innerHeight - margin.top - margin.bottom)
    .append('g')
    .attr('transform', `translate(${margin.left}, ${margin.top})`)
    .attr('color', '#e6e8ea')
    .attr('font-weight', 'bold')
    .attr('stroke-width', 2);

window.addEventListener('resize', function (event) {
    d3.select('svg').attr('viewBox', `${viewBox.x} ${viewBox.y} ${viewBox.w} ${viewBox.h}`)
        .attr('width', window.innerWidth - margin.left - margin.right)
        .attr('height', window.innerHeight - margin.top - margin.bottom)
});

const xrange = [0, 10];
const yrange = [0, 10];

const x = d3.scaleLinear()
    .domain(xrange)
    .range([0, width]);

const y = d3.scaleLinear()
    .domain(yrange)
    .range([height, 0]);

const getRandomPoint = () => {
    const point = {
        x: Math.random() * xrange[1],
        y: Math.random() * yrange[1],
        cluster: null
    };

    return point;
}

const generatePoints = (n) => {
    return Array.from(Array(n)).map(_ => getRandomPoint());
}

const distance = (a, b) => {
    return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}


let points, centroids, pointsSvg, centroidsSvg;

const color = d3.scaleOrdinal(d3.schemeCategory10);

svg.append('g')
    .attr('transform', `translate(0, ${height})`)
    .call(d3.axisBottom(x));

svg.append('g')
    .call(d3.axisLeft(y));

const closestCentroid = (point) => {
    const distances = centroids.map(centroid => distance(point, centroid));
    const i = distances.findIndex(d => d === Math.min(...distances));
    return i;
}

const updatePoints = () => {
    points.forEach(point => {
        point.cluster = closestCentroid(point);
    });
    pointsSvg.transition().duration(500).style('fill', d => color(d.cluster));
}

const avg = (arr) => arr.reduce((p, c) => p + c, 0) / arr.length;
const updateCentroids = () => {
    centroids.forEach((centroid, i) => {
        const cluster = points.filter(point => point.cluster === i);
        if (cluster.length > 0) {
            centroid.x = avg(cluster.map(point => point.x));
            centroid.y = avg(cluster.map(point => point.y));
        }
    });
    centroidsSvg.transition().duration(500).attr('cx', d => x(d.x)).attr('cy', d => y(d.y));
}

const start = () => {
    updatePoints();
    interval = setInterval(() => {
        updateCentroids();
        updatePoints();
    }, 1000);
}

let interval;

const stop = () => {
    if (interval) {
        clearInterval(interval);
        interval = null;
    }
}

const reset = () => {
    stop();

    points = generatePoints(numPoints);
    centroids = generatePoints(numClusters);

    d3.select('#points-svg').remove();
    d3.select('#centroids-svg').remove();
    pointsSvg = svg.append('g')
        .attr('id', 'points-svg')
        .selectAll('dot')
        .data(points)
        .join('circle')
        .attr('cx', d => x(d.x))
        .attr('cy', d => y(d.y))
        .attr('r', 4)
        .style('fill', d => color(d.cluster));

    centroidsSvg = svg.append('g')
        .attr('id', 'centroids-svg')
        .selectAll('dot')
        .data(centroids)
        .join('circle')
        .attr('cx', d => x(d.x))
        .attr('cy', d => y(d.y))
        .attr('r', 5)
        .style('fill', '#e6e8ea')
        .attr('stroke', (d, i) => color(i))
        .attr('stroke-width', 2);

    stopBtn.innerText = 'Stop';

    start();
}

reset();
