// script.js

document.getElementById('generate').addEventListener('click', () => {
    const username = document.getElementById('username').value.trim();
    if (username) {
      fetchData(username);
    } else {
      alert('Please enter a Twitter username.');
    }
  });
  
  async function fetchData(username) {
    try {
      const response = await fetch(`http://localhost:3000/api/circle/${username}`);
      const data = await response.json();
  
      if (data.error) {
        alert('Error fetching data. Please try again.');
        return;
      }
  
      drawGraph(data);
    } catch (error) {
      console.error('Error:', error);
    }
  }
  
  function drawGraph(graph) {
    // Clear previous visualization
    d3.select('#visualization').selectAll('*').remove();
  
    const width = 600;
    const height = 600;
  
    const svg = d3
      .select('#visualization')
      .append('svg')
      .attr('width', width)
      .attr('height', height);
  
    const simulation = d3
      .forceSimulation(graph.nodes)
      .force(
        'link',
        d3.forceLink(graph.links).id((d) => d.id)
      )
      .force('charge', d3.forceManyBody().strength(-400))
      .force('center', d3.forceCenter(width / 2, height / 2));
  
    const link = svg
      .append('g')
      .attr('stroke', '#999')
      .selectAll('line')
      .data(graph.links)
      .enter()
      .append('line')
      .attr('stroke-width', 2);
  
    const node = svg
      .append('g')
      .selectAll('circle')
      .data(graph.nodes)
      .enter()
      .append('circle')
      .attr('r', 20)
      .attr('fill', (d) => (d.group === 1 ? '#1da1f2' : '#657786'))
      .call(
        d3
          .drag()
          .on('start', dragStarted)
          .on('drag', dragged)
          .on('end', dragEnded)
      );
  
    const labels = svg
      .append('g')
      .selectAll('text')
      .data(graph.nodes)
      .enter()
      .append('text')
      .attr('dy', 4)
      .attr('text-anchor', 'middle')
      .text((d) => d.name)
      .style('pointer-events', 'none')
      .style('font-size', '12px');
  
    simulation.on('tick', () => {
      link
        .attr('x1', (d) => d.source.x)
        .attr('y1', (d) => d.source.y)
        .attr('x2', (d) => d.target.x)
        .attr('y2', (d) => d.target.y);
  
      node.attr('cx', (d) => d.x).attr('cy', (d) => d.y);
  
      labels.attr('x', (d) => d.x).attr('y', (d) => d.y);
    });
  
    function dragStarted(event, d) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }
  
    function dragged(event, d) {
      d.fx = event.x;
      d.fy = event.y;
    }
  
    function dragEnded(event, d) {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }
  }
  // Function to get user ID by username
async function getUserID(username) {
    try {
      const response = await axios.get(
        `${twitterAPI}/users/by/username/${username}`,
        {
          headers: {
            Authorization: `Bearer ${process.env.TWITTER_BEARER_TOKEN}`,
          },
        }
      );
      return response.data.data.id;
    } catch (error) {
      console.error('Error fetching user ID:', error.response ? error.response.data : error.message);
      throw error;
    }
  }
  