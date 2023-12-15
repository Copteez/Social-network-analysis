// This script use Library from https://d3-graph-gallery.com/network.html as a main source tools

document.addEventListener("DOMContentLoaded", function () {
    // Create the SVG container for the graph
    const svg = d3.select("#graph-container")
        .append("svg")
        .attr("width", "100%")
        .attr("height", "100%")
        .call(d3.zoom().on("zoom", zoomed))
        .append("g");

    // Declare variables
    let node, link, simulation;

    // Sample data for the flowchart
    Promise.all([
        d3.csv("nodes.csv"),
        d3.csv("links.csv")
    ]).then(([nodes, links]) => {
        
        // Draw the links
        link = svg.selectAll(".link")
            .data(links)
            .enter().append("line")
            .attr("class", "link")
            .style("stroke", "gray"); // Color links based on condition

        // Draw the nodes
        node = svg.selectAll(".node")
            .data(nodes)
            .enter().append("g")
            .attr("class", "node")
            .style("stroke", "black") // Color links based on condition
            .call(d3.drag()
                .on("start", dragStarted)
                .on("drag", dragging)
                .on("end", dragEnded));

        node.append("circle")
            .attr("r", d => 20)
            .style("fill", d => d.color); // Set the fill color based on the color property

        node.append("text")
            .attr("dy", 4)
            .style("text-anchor", "middle")
            .text(d => d.name);

        // Create the force simulation
        simulation = d3.forceSimulation(nodes)
            .force("link", d3.forceLink(links).id(d => d.id))
            .force("charge", d3.forceManyBody().strength(-300))
            .force("center", d3.forceCenter(window.innerWidth / 2, window.innerHeight / 2));

        // Update the position of nodes and links in each iteration of the simulation
        simulation.on("tick", () => {
            link
                .attr("x1", d => d.source.x)
                .attr("y1", d => d.source.y)
                .attr("x2", d => d.target.x)
                .attr("y2", d => d.target.y);

            node
                .attr("transform", d => `translate(${d.x},${d.y})`)
                .select("circle")
                .attr("r", d => calculateNodeRadius(d));
                // Add a function to calculate the radius based on the number of connected nodes
                function calculateNodeRadius(d) {
                    // Count the number of links where the node is either the source or target
                    const connectedLinks = links.filter(link => link.source.id === d.id || link.target.id === d.id);
                    // Calculate the radius based on the number of connected nodes
                    const radius = 20 + connectedLinks.length * 5; // Adjust the multiplier as needed
                    return radius;
                }
        });

        // Append title (tooltip) to the group for each node
        node.append("title")
            .text(d => d.name); // Set tooltip text based on node name
    });




    // Drag functions
    function dragStarted(event, d) {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
    }

    function dragging(event, d) {
        d.fx = event.x;
        d.fy = event.y;
    }

    function dragEnded(event, d) {
        if (!event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
    }
    // Zoom function
    function zoomed(event) {
        svg.attr("transform", event.transform);
    }
});
