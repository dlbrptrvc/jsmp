//A Component is a data structure that stores the information about the interactable parts of a device
//Each Component has it's own way of interacting between one another
//A device is what defines the way these components comunicate

class Component {
	typeList = [Slider, Input, Button, ScriptPad];
	constructor(type) {
		this.type = type;
		this.id = null;
		this.output = [];
		this.input = [];
	}
	build(name) {
		div = new window[type](name).build();
		div.classList.add("component", type);
	}
}

class Button {
	constructor(name) {
		this.name = name;
	}
	build() {
		button = document.createElement("button");
		button.textContent = "Run";
		label = document.createElement("label");
		label.textContent = this.name;
	}
}

class Input {
	constructor(name) {
		this.name = name;
	}
	build() {
		input = document.createElement("input");
		label = document.createElement("label");
		label.textContent = this.name;
	}
}

class Slider extends Component {
	constructor(name) {
		this.name = name;
		this.unit = "";
		this.currentInput = 100;
		this.minInput = 0;
		this.maxInput = 10000;
	}
	createSlider(name) {
		div = new Component("Slider").createComponent().createSlider(name);
		div.classList.add("slider");
		return div;
	}
}

test = new Component("Slider");
element = test.createComponent();
console.log(element);

class Device {
	deviceTypeList = ["Clicker"];
	constructor(type) {
		this.type = type;
		this.components = [];
		this.output = [];
		this.input = [];
	}

	createDevice() {
		const div = document.createElement("div");
		label = document.createElement("label");
		label.textContent = type;
		div.classList.add("device");
		return div;
	}
}

class Rack {
	constructor(id) {
		this.id = id;
		this.devices = [];
		this.element = document.createElement("div");
		this.element.classList.add("rack");
		this.element.dataset.rackId = id;
		this.element.textContent = `Rack ${id}`;
		this.element.addEventListener("click", () => this.selectRack());

		// Device container inside the rack
		this.deviceContainer = document.createElement("div");
		this.deviceContainer.classList.add("device-container");
		this.element.appendChild(this.deviceContainer);
	}

	selectRack() {
		document
			.querySelectorAll(".rack")
			.forEach((r) => r.classList.remove("selected"));
		this.element.classList.add("selected");

		// Update dropdown selection
		document.getElementById("rackList").value = this.id;
	}

	addDevice(device) {
		device.id = this.devices.length();
		this.devices.push(device);
		this.deviceContainer.appendChild(device.createElement());

		// Add device to the current device list dropdown
		const option = document.createElement("option");
		option.value = device.name;
		option.textContent = `Rack ${this.id}: ${device.name}`;
		document.getElementById("currentDeviceList").appendChild(option);
	}

	removeDevice(deviceName) {
		// Remove from stored device list
		this.devices = this.devices.filter((device) => device.name !== deviceName);

		// Remove from UI
		[...this.deviceContainer.children].forEach((child) => {
			if (child.textContent === deviceName) {
				child.remove();
			}
		});
	}
}

class Machine {
	constructor() {
		this.racks = [];
		this.selectedRack = null;
		this.init();
	}

	init() {
		// UI event listeners
		document
			.getElementById("addRackButton")
			.addEventListener("click", () => this.addRack());
		document
			.getElementById("removeRackButton")
			.addEventListener("click", () => this.removeRack());
		document
			.getElementById("addDeviceButton")
			.addEventListener("click", () => this.addDeviceToSelectedRack());
		document
			.getElementById("removeDeviceButton")
			.addEventListener("click", () => this.removeDeviceFromRack());

		// Populate device list
		const devices = [
			"Synth 1",
			"Synth 2",
			"Drum Machine",
			"Mixer",
			"Effects Unit",
		];
		const deviceList = document.getElementById("deviceList");
		devices.forEach((device) => {
			const option = document.createElement("option");
			option.value = device;
			option.textContent = device;
			deviceList.appendChild(option);
		});

		// Track rack selection via dropdown
		document.getElementById("rackList").addEventListener("change", (event) => {
			this.selectRackById(event.target.value);
		});
	}

	addRack() {
		const id = this.racks.length + 1;
		const rack = new Rack(id);
		this.racks.push(rack);
		document.getElementById("rackContainer").appendChild(rack.element);

		// Update dropdown
		const option = document.createElement("option");
		option.value = id;
		option.textContent = `Rack ${id}`;
		document.getElementById("rackList").appendChild(option);

		// Auto-select the new rack
		this.selectRack(rack);
	}

	removeRack() {
		if (this.racks.length > 0) {
			const lastRack = this.racks.pop();
			lastRack.element.remove();

			// Remove from dropdown
			const rackList = document.getElementById("rackList");
			rackList.removeChild(rackList.lastChild);

			// If the removed rack was selected, clear selection
			if (this.selectedRack === lastRack) {
				this.selectedRack = null;
				rackList.value = "";
			}
		}
	}

	selectRack(rack) {
		document
			.querySelectorAll(".rack")
			.forEach((r) => r.classList.remove("selected"));
		rack.element.classList.add("selected");
		this.selectedRack = rack;

		// Update dropdown selection
		document.getElementById("rackList").value = rack.id;
	}

	selectRackById(id) {
		const rack = this.racks.find((r) => r.id == id);
		if (rack) {
			this.selectRack(rack);
		}
	}

	addDeviceToSelectedRack() {
		if (!this.selectedRack) return;

		const selectedDevice = document.getElementById("deviceList").value;
		const device = new Device(selectedDevice);
		this.selectedRack.addDevice(device);
	}

	removeDeviceFromRack() {
		const currentDeviceList = document.getElementById("currentDeviceList");

		if (currentDeviceList.selectedIndex !== -1) {
			const selectedOption =
				currentDeviceList.options[currentDeviceList.selectedIndex];
			const deviceName = selectedOption.value;
			const rackIdMatch = selectedOption.textContent.match(/Rack (\d+)/);

			if (rackIdMatch) {
				const rackId = parseInt(rackIdMatch[1], 10);
				const rack = this.racks.find((r) => r.id === rackId);

				if (rack) {
					rack.removeDevice(deviceName);
				}
			}

			// Remove from the dropdown
			currentDeviceList.removeChild(selectedOption);
		}
	}
}
