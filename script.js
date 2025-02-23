//begining
const tracksContainer = document.getElementById("tracksContainer");
const addTrackButton = document.getElementById("addTrackButton");
const playMusicButton = document.getElementById("playMusicButton");
const stopMusicButton = document.getElementById("stopMusicButton");
const shiftStepSlider = document.getElementById("shiftStepSlider");
const shiftStepValue = document.getElementById("shiftStepValue");
shiftStepSlider.addEventListener("input", () => {
	shiftStepValue.textContent = shiftStepSlider.value;
});

let tracks = [];
let audioContext;
let isPlaying = false;

// Create a new slider
function createSlider(label, unit, [min, max, step, value]) {
	let sliderbox = document.createElement("div");
	sliderbox.style.display = "flex";
	sliderbox.style.justifyContent = "space-between";
	let slider = document.createElement("input");
	let slabel = document.createElement("label");
	let svalue = document.createElement("span");
	slabel.textContent = "||" + label + " " + unit;
	slider.type = "range";
	slider.min = min;
	slider.max = max;
	slider.step = step;
	slider.value = value;
	slider.oninput = (e) => {
		e.target.nextElementSibling.textContent = e.target.value;
		//TODO:Reactivate music if it is playing
	};
	svalue.textContent = slider.value;
	sliderbox.append(slabel, slider, svalue);
	return sliderbox;
}

//Create a Randomizable Slider
function randomizeSlider(
	label,
	unit,
	[min, max, step, value],
	[rmin, rmax, rstep, rvalue],
	[imin, imax, istep, ivalue]
) {
	let box = document.createElement("div");
	let randomizeProcess = null;
	let svalue = createSlider(label, unit, [min, max, step, value]);
	let range = createSlider("Range", unit, [rmin, rmax, rstep, rvalue]);
	let interval = createSlider("Interval", "(s)", [imin, imax, istep, ivalue]);
	let randomizeButton = document.createElement("button");
	turnOffRandomize(randomizeButton);
	randomizeButton.onclick = (e) => {
		let button = e.target;
		if (button.dataset.randomize === "Off") {
			randomizeProcess = turnOnRandomize(button);
		} else {
			turnOffRandomize(button);
			clearInterval(randomizeProcess);
		}
	};
	range.oninput = () => {
		console.log("Randomize range has changed");
		if (randomizeProcess) {
			clearInterval(randomizeProcess);
			randomizeProcess = startRepeatingFunction(randomizeProcess, box);
		}
	};
	interval.oninput = () => {
		console.log("Randomize interval has changed");
		if (randomizeProcess) {
			clearInterval(randomizeProcess);
			randomizeProcess = startRepeatingFunction(randomizeProcess, box);
		}
	};
	box.append(svalue, range, interval, randomizeButton);
	return box;
}

//turn on Randomize
function turnOnRandomize(elem) {
	elem.dataset.randomize = "On";
	elem.textContent = "Randomize is ON";
	let box = elem.parentElement;
	let randomizeProcess = null;
	randomizeProcess = startRepeatingFunction(randomizeProcess, box);
	return randomizeProcess;
}

function startRepeatingFunction(currentProcess, box) {
	let slider = box.children[0].children[1];
	let range = box.children[1].children[1];
	let interval = box.children[2].children[1];

	currentProcess = setInterval(() => {
		const step = parseFloat(range.value);
		const current = parseFloat(slider.value);
		const intendedMin = current - step;
		const intendedMax = current + step;
		// Generate a truly random value within this range
		let randomValue = (
			Math.random() * (intendedMax - intendedMin) +
			intendedMin
		).toFixed(2);
		// Clamp the random value within the slider's min and max limits
		randomValue = Math.max(
			parseFloat(slider.min),
			Math.min(parseFloat(slider.max), randomValue)
		);
		slider.value = randomValue;
		slider.dispatchEvent(new Event("input"));
	}, interval.value * 1000);
	return currentProcess;
}

//turn off Randomize
function turnOffRandomize(elem) {
	elem.dataset.randomize = "Off";
	elem.textContent = "Randomize is OFF";
}

//Create a new track
function createTrack() {
	let track = document.createElement("div");
	track.style.display = "flex";
	track.classList.add("track");
	let frequencybox = randomizeSlider(
		"Frequency",
		"(Hz)",
		[70, 1000, 0.01, 400],
		[0.1, 100, 0.1, 50],
		[0.1, 10.0, 0.1, 1]
	);
	let periodbox = randomizeSlider(
		"Period",
		"(s)",
		[0.01, 12.0, 0.01, 1],
		[0.01, 12.0, 0.01, 12.0],
		[0.1, 10.0, 0.1, 1]
	);
	let volumebox = randomizeSlider(
		"Volume",
		"(%)",
		[0, 1, 0.01, 0.5],
		[0.01, 1, 0.01, 0.1],
		[0.1, 10.0, 0.1, 1]
	);
	let removebutton = document.createElement("button");
	Object.assign(removebutton, {
		textContent: "Remove Track",
		onclick: (e) => {
			let btn = e.target;
			let track = btn.parentElement;
			let vslider = track.children[2].children[0].children[0];
			vslider.value = 0;
			vslider.dispatchEvent(new Event("input"));
			track.remove();
			//
			//<---Remove the pending processes as well
			//
		},
	});
	track.append(frequencybox, periodbox, volumebox, removebutton);
	tracksContainer.append(track);
	tracks.push(track);
}

// Play music
function playMusic() {
	if (isPlaying) return; // Prevent multiple loops
	isPlaying = true;
	audioContext = new (window.AudioContext || window.webkitAudioContext)();

	const nextPlayTimes = tracks.map(() => audioContext.currentTime); // Initialize play times
	console.log("Creating a loop");
	const loop = () => {
		const currentTime = audioContext.currentTime;

		tracks.forEach((track, index) => {
			let frequencySlider = track.children[0].children[0].children[1];
			let intervalSlider = track.children[1].children[0].children[1];
			let volumeSlider = track.children[2].children[0].children[1];

			const frequency = parseFloat(frequencySlider.value);
			const volume = parseFloat(volumeSlider.value);
			const interval = parseFloat(intervalSlider.value); // Time between notes

			// If it's time to play this track
			if (currentTime >= nextPlayTimes[index]) {
				const oscillator = audioContext.createOscillator();
				const gainNode = audioContext.createGain();

				oscillator.type = "sine";
				oscillator.frequency.setValueAtTime(frequency, currentTime);
				gainNode.gain.setValueAtTime(volume, currentTime);

				oscillator.connect(gainNode);
				gainNode.connect(audioContext.destination);

				oscillator.start(currentTime);
				oscillator.stop(currentTime + 0.5); // Play tone for 0.5s

				// Schedule next play time
				nextPlayTimes[index] = currentTime + interval;
			}
		});

		// Continue loop every 100ms
		if (isPlaying) {
			setTimeout(loop, 100);
		}
	};

	loop();
}

// Stop music
function stopMusic() {
	if (!isPlaying) return;
	isPlaying = false;
	if (audioContext) {
		audioContext.close();
		audioContext = null;
	}
}

// Event listeners
addTrackButton.addEventListener("click", createTrack);
playMusicButton.addEventListener("click", playMusic);
stopMusicButton.addEventListener("click", stopMusic);
// Function to get all current sliders, including dynamically added ones
function getAllSliders() {
	return document.querySelectorAll('input[type="range"]');
}

let randomizeInterval = null;

const intervalSlider = document.getElementById("randomizeIntervalSlider");
const intervalValueDisplay = document.getElementById("randomizeIntervalValue");
intervalSlider.addEventListener("input", () => {
	intervalValueDisplay.textContent = intervalSlider.value;
});

// Randomize button functionality
document.getElementById("randomizeButton").addEventListener("click", () => {
	if (randomizeInterval) {
		clearTimeout(randomizeInterval);
		randomizeInterval = null;
		return;
	}

	function randomizeSlider() {
		const sliders = getAllSliders(); // Get all current sliders dynamically
		if (sliders.length === 0) return; // Safety check

		const randomIndex = Math.floor(Math.random() * sliders.length); // Pick a random slider
		const slider = sliders[randomIndex];
		const step = parseFloat(document.getElementById("shiftStepSlider").value); // Get shift step
		const current = parseFloat(slider.value);
		const min = Math.max(parseFloat(slider.min), current - step); // Ensure within slider min limit
		const max = Math.min(parseFloat(slider.max), current + step); // Ensure within slider max limit
		const randomValue = (Math.random() * (max - min) + min).toFixed(2); // True random value within range
		slider.value = randomValue;
		slider.dispatchEvent(new Event("input"));

		// Get the new interval time dynamically
		const intervalTime = parseFloat(intervalSlider.value) * 1000;
		randomizeInterval = setTimeout(randomizeSlider, intervalTime); // Call itself again
	}

	randomizeSlider(); // Start the recursive function
});

// Go Steady button functionality
document.getElementById("goSteadyButton").addEventListener("click", () => {
	if (randomizeInterval) {
		clearInterval(randomizeInterval);
		randomizeInterval = null;
	}
	const sliders = getAllSliders(); // Get all current sliders dynamically
	sliders.forEach((slider) => {
		const initialValue = slider.getAttribute("data-initial-value");
		if (initialValue !== null) {
			slider.value = initialValue; // Reset to initial value if stored
			const valueDisplay = document.getElementById(slider.id + "Value");
			if (valueDisplay) valueDisplay.textContent = initialValue; // Update displayed value
		}
	});
});

// Ensure new sliders have their initial value stored when added dynamically
function initializeSlider(slider) {
	slider.setAttribute("data-initial-value", slider.value);
}
