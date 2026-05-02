const data = {
  companies: [
    {
      id: "apple",
      name: "Apple",
      products: [
        { name: "iPhone", annualUnits: "~230M", components: [
          { name: "A-series SoC", amountPerUnit: "1 chip", process: "5/3nm wafer fabrication", resources: ["Silicon", "Copper", "Gold", "Neon"] },
          { name: "OLED display", amountPerUnit: "1 panel", process: "Glass + thin-film deposition", resources: ["Silica", "Indium", "Rare earths"] },
          { name: "Battery", amountPerUnit: "1 pack", process: "Cell manufacturing", resources: ["Lithium", "Nickel", "Cobalt", "Graphite"] }
        ]}
      ]
    },
    {
      id: "microsoft",
      name: "Microsoft",
      products: [
        { name: "Azure Server Rack", annualUnits: "Confidential", components: [
          { name: "Server CPUs/GPUs", amountPerUnit: "varies", process: "Advanced semiconductor packaging", resources: ["Silicon", "Copper", "Gold", "Tin"] },
          { name: "Memory modules", amountPerUnit: "TB-scale", process: "DRAM/NAND fabrication", resources: ["Silicon", "Argon", "Phosphorus"] }
        ]}
      ]
    },
    {
      id: "amazon",
      name: "Amazon",
      products: [
        { name: "AWS Data Center Cluster", annualUnits: "Expanding", components: [
          { name: "Custom Trainium/Graviton chips", amountPerUnit: "thousands", process: "Foundry fabrication", resources: ["Silicon", "Copper", "Nickel"] },
          { name: "Networking equipment", amountPerUnit: "hundreds", process: "PCB and optics assembly", resources: ["Silica", "Copper", "Gold", "Plastic polymers"] }
        ]}
      ]
    },
    {
      id: "alphabet",
      name: "Alphabet",
      products: [
        { name: "Pixel Phone", annualUnits: "~10M", components: [
          { name: "Tensor SoC", amountPerUnit: "1 chip", process: "Wafer fab + packaging", resources: ["Silicon", "Copper", "Neon"] },
          { name: "Camera module", amountPerUnit: "multiple lenses", process: "Lens grinding + sensor assembly", resources: ["Silica", "Aluminum", "Rare earths"] }
        ]}
      ]
    },
    {
      id: "meta",
      name: "Meta",
      products: [
        { name: "VR Headset", annualUnits: "millions", components: [
          { name: "Display optics", amountPerUnit: "2 lenses + panels", process: "Optics molding", resources: ["Silica", "Plastic polymers"] },
          { name: "Compute board", amountPerUnit: "1 board", process: "PCB + chip integration", resources: ["Copper", "Gold", "Tin", "Silicon"] }
        ]}
      ]
    },
    {
      id: "nvidia",
      name: "Nvidia",
      products: [
        { name: "AI GPU", annualUnits: "millions", components: [
          { name: "GPU die", amountPerUnit: "1 die", process: "Leading-edge lithography", resources: ["Silicon", "Neon", "Palladium"] },
          { name: "HBM stack", amountPerUnit: "several stacks", process: "3D packaging", resources: ["Silicon", "Gold", "Copper"] },
          { name: "Substrate", amountPerUnit: "1 substrate", process: "ABF substrate manufacturing", resources: ["Glass fiber", "Epoxy resin", "Copper"] }
        ]}
      ]
    },
    {
      id: "tesla",
      name: "Tesla",
      products: [
        { name: "Model Y", annualUnits: "~1M", components: [
          { name: "Battery pack", amountPerUnit: "1 pack", process: "Cell production + module assembly", resources: ["Lithium", "Nickel", "Graphite", "Aluminum"] },
          { name: "Electric motors", amountPerUnit: "1-2 motors", process: "Magnet + winding manufacture", resources: ["Copper", "Rare earths", "Steel (iron ore)"] },
          { name: "Body frame", amountPerUnit: "1 frame", process: "Casting + stamping", resources: ["Aluminum", "Iron ore", "Manganese"] }
        ]}
      ]
    }
  ]
};

const svg = document.getElementById("graph");
const detailsPanel = document.getElementById("detailsPanel");
const companySelect = document.getElementById("companySelect");
const productSelect = document.getElementById("productSelect");
const viewMode = document.getElementById("viewMode");

function colorByType(type) {
  return {
    company: "#7dd3fc",
    product: "#34d399",
    component: "#fbbf24",
    process: "#f472b6",
    resource: "#f87171"
  }[type];
}

function initSelectors() {
  data.companies.forEach((c) => {
    const option = document.createElement("option");
    option.value = c.id;
    option.textContent = c.name;
    companySelect.appendChild(option);
  });
  populateProductSelector();
}

function populateProductSelector() {
  const company = data.companies.find(c => c.id === companySelect.value) || data.companies[0];
  productSelect.innerHTML = "";
  company.products.forEach((p) => {
    const option = document.createElement("option");
    option.value = p.name;
    option.textContent = p.name;
    productSelect.appendChild(option);
  });
}

function buildGraphItems() {
  const mode = viewMode.value;
  let activeCompanies = data.companies;
  if (mode !== "all") {
    const selected = data.companies.find(c => c.id === companySelect.value) || data.companies[0];
    activeCompanies = [selected];
  }

  const nodes = [];
  const edges = [];

  activeCompanies.forEach((company, cIndex) => {
    const companyNodeId = `company-${company.id}`;
    nodes.push({ id: companyNodeId, label: company.name, type: "company", x: 90, y: 80 + cIndex * 95, meta: company });

    const products = (mode === "product")
      ? company.products.filter(p => p.name === productSelect.value)
      : company.products;

    products.forEach((product, pIndex) => {
      const py = 80 + cIndex * 95 + pIndex * 70;
      const productId = `${companyNodeId}-product-${product.name}`;
      nodes.push({ id: productId, label: product.name, type: "product", x: 310, y: py, meta: product });
      edges.push({ from: companyNodeId, to: productId });

      product.components.forEach((component, compIndex) => {
        const cy = py + compIndex * 55;
        const componentId = `${productId}-component-${component.name}`;
        const processId = `${componentId}-process`;

        nodes.push({ id: componentId, label: component.name, type: "component", x: 560, y: cy, meta: component });
        nodes.push({ id: processId, label: component.process, type: "process", x: 800, y: cy, meta: component });
        edges.push({ from: productId, to: componentId });
        edges.push({ from: componentId, to: processId });

        component.resources.forEach((resource, rIndex) => {
          const resourceId = `${processId}-resource-${resource}`;
          nodes.push({ id: resourceId, label: resource, type: "resource", x: 1050, y: cy + rIndex * 22, meta: { resource, component, product, company } });
          edges.push({ from: processId, to: resourceId });
        });
      });
    });
  });

  return { nodes, edges };
}

function render() {
  svg.innerHTML = "";
  const { nodes, edges } = buildGraphItems();

  edges.forEach((edge) => {
    const from = nodes.find(n => n.id === edge.from);
    const to = nodes.find(n => n.id === edge.to);
    if (!from || !to) return;
    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line.setAttribute("x1", from.x);
    line.setAttribute("y1", from.y);
    line.setAttribute("x2", to.x);
    line.setAttribute("y2", to.y);
    line.setAttribute("class", "edge");
    svg.appendChild(line);
  });

  nodes.forEach((node) => {
    const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
    g.setAttribute("class", "node");
    g.setAttribute("transform", `translate(${node.x}, ${node.y})`);

    const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    circle.setAttribute("r", "10");
    circle.setAttribute("fill", colorByType(node.type));

    const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
    text.setAttribute("x", "14");
    text.setAttribute("y", "4");
    text.textContent = node.label;

    g.appendChild(circle);
    g.appendChild(text);
    g.addEventListener("click", () => showDetails(node));
    svg.appendChild(g);
  });
}

function showDetails(node) {
  const meta = node.meta || {};
  let body = `<div class="details-card"><h3>${node.label}</h3><p><strong>Type:</strong> ${node.type}</p>`;

  if (node.type === "product") {
    body += `<p><strong>Annual units:</strong> ${meta.annualUnits || "n/a"}</p>`;
    body += `<p><strong>Components tracked:</strong> ${meta.components.length}</p>`;
  }
  if (node.type === "component") {
    body += `<p><strong>Amount per unit:</strong> ${meta.amountPerUnit}</p><p><strong>Process:</strong> ${meta.process}</p>`;
  }
  if (node.type === "process") {
    body += `<p>Linked component amount: ${meta.amountPerUnit}</p><p>Resource count: ${meta.resources.length}</p>`;
  }
  if (node.type === "resource") {
    body += `<p><strong>Resource:</strong> ${meta.resource}</p>`;
    body += `<p>Upstream component: ${meta.component.name}</p>`;
    body += `<p>Product: ${meta.product.name} • Company: ${meta.company.name}</p>`;
  }

  body += "</div>";
  detailsPanel.innerHTML = body;
}

companySelect.addEventListener("change", () => {
  populateProductSelector();
  render();
});
productSelect.addEventListener("change", render);
viewMode.addEventListener("change", render);

initSelectors();
companySelect.value = data.companies[0].id;
populateProductSelector();
render();
