let data;
let lines;

const renderVisualization = () => {
    const containerWidth = document.getElementById("visualization").clientWidth;
    const containerHeight = document.getElementById("visualization").clientHeight;

    const margin = {
        top: 0.1 * containerHeight,
        right: 0.1 * containerWidth,
        bottom: 0.1 * containerHeight,
        left: 0.1 * containerWidth
    };

    const width = containerWidth - (margin.right + margin.left);
    const height = containerHeight - (margin.top + margin.bottom);

    const svg = d3.select(`#visualization`);
    const chartArea = svg.append('g')
        .attr("transform", `translate(${margin.left}, ${margin.top})`);

    const xScale = d3.scaleLinear().domain([0, 9]).range([0, width]);
    const yScale = d3.scaleLinear().domain([0, 2.1]).range([0, height]);

    const lineWidth = width / 78;

    const languageColours = {
        "Latin": "#93A3BC",
        "Proto-Germanic": "#98B06F",
        "French": "#392F5A",
        "German": "#FFA552",
        "English": "#CC92C2",
        "Norwegian": "#C1666B"
    }

    const links = [];
    data.forEach(d => {
        if ("formed" in d) {
            d.formed.forEach(p => {
                links.push({ from: data.find(f => f.word === p).pos, to: d.pos });
            });
        }
        if ("borrowed" in d) {
            links.push({ from: data.find(f => f.word + f.language === d.borrowed).pos, to: d.pos });
        }
    });

    chartArea.selectAll("path")
        .data(links)
        .join("path")
        .attr("fill", "none")
        .attr("stroke", "#1E3888")
        .attr("stroke-width", width * 0.015)
        .attr("stroke-dasharray", `${width / 16} ${width / 50}`)
        .attr("opacity", 0.8)
        .attr("d", d => {
            const line = d3.line()
                .x(d => xScale(d[0]))
                .y(d => yScale(d[1]))
                .curve(d3.curveBumpY);

            const points = [d.from];
            points.push([d.from[0] + (d.to[0] - d.from[0]) / 16, d.from[1] + (d.to[1] - d.from[1]) / 8]);
            points.push([d.from[0] + 15 * (d.to[0] - d.from[0]) / 16, d.from[1] + 7 * (d.to[1] - d.from[1]) / 8]);
            points.push(d.to);
            
            return line(points);
        });

    chartArea.selectAll("circle.back")
        .data(data)
        .join("circle")
        .attr("class", "back")
        .attr("r", width / 12)
        .attr("transform", d => `translate(${xScale(d.pos[0])}, ${yScale(d.pos[1])})`)
        .attr("fill", d => languageColours[d.language]);

    chartArea.selectAll("circle.hide")
        .data(data)
        .join("circle")
        .attr("class", "hide")
        .attr("r", width / 14)
        .attr("transform", d => `translate(${xScale(d.pos[0])}, ${yScale(d.pos[1])})`)
        .attr("fill", d => "white");

    const circles = chartArea.append("g")
        .attr("opacity", 0.4);

    circles.selectAll("circle.front")
        .data(data)
        .join("circle")
        .attr("class", "front")
        .attr("r", width / 14)
        .attr("transform", d => `translate(${xScale(d.pos[0])}, ${yScale(d.pos[1])})`)
        .attr("fill", d => languageColours[d.language]);

    chartArea.selectAll("text.word")
        .data(data)
        .join("text")
        .attr("class", "word")
        .attr("text-multiplier", 0.55)
        .attr("font-style", "italic")
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "middle")
        .attr("transform", d => `translate(${xScale(d.pos[0])}, ${yScale(d.pos[1]) - height * 0.015})`)
        .text(d => d.word);

    chartArea.selectAll("text.meaning")
        .data(data)
        .join("text")
        .attr("class", "meaning")
        .attr("text-multiplier", 0.55)
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "middle")
        .attr("transform", d => `translate(${xScale(d.pos[0])}, ${yScale(d.pos[1]) + height * 0.025})`)
        .text(d => d.association);
};

const resizeAndRender = () => {
    d3.selectAll("#visualization > *").remove();

    renderVisualization();

    d3.selectAll("text")
        .attr("font-size", function() { return d3.select(this).attr("text-multiplier") * 0.03 * document.getElementById("visualization").clientWidth });
};

window.onresize = resizeAndRender;

Promise.all([d3.json('data/data.json')]).then(([_data]) => {
    data = _data;

    resizeAndRender();
});