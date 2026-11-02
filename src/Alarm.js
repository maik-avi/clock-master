export default class Alarm extends HTMLElement {
  #intervalCallback;
  #intervalId = 0;

  constructor() {
    super();
    this.addEventListener("click", this);
    this.duration = 60 * 1000;
    this.#intervalCallback = () => {
    const now = new Date();

    this.alarms.forEach((alarm) => {
      const status = alarm.querySelector(".alarm-status");

      if (alarm.hasAttribute("paused")) {
       if (alarm.hasAttribute("ringing")) {
         alarm.removeAttribute("ringing");

         this.dispatchEvent(
          new CustomEvent("silence", {
            bubbles: true,
            detail: alarm,
          }),
        );
      }

      status.textContent = "Desactivada";
      return;
    }

    const value = alarm.querySelector("input").value;

    if (!value) {
      return;
    }

    const [hours, minutes] = value.split(":").map(Number);

    const shouldRing =
      hours === now.getHours() &&
      minutes === now.getMinutes();

    if (shouldRing && !alarm.hasAttribute("ringing")) {
      alarm.setAttribute("ringing", "");
      status.textContent = "Sonant";

      this.dispatchEvent(
        new CustomEvent("ring", {
          bubbles: true,
          detail: alarm,
        }),
      );
    }

    if (!shouldRing && alarm.hasAttribute("ringing")) {
      alarm.removeAttribute("ringing");
      status.textContent = "Activada";

      this.dispatchEvent(
        new CustomEvent("silence", {
          bubbles: true,
          detail: alarm,
        }),
      );
    }
  });
};
  }

  get alarms() {
    return [...this.querySelector(".items").children];
  }

  get duration() {
    return Number(this.getAttribute("duration"));
  }

  set duration(value) {
    this.setAttribute("duration", value);
  }

  add() {
    const alarm = this.querySelector("template").content.cloneNode(true);
    this.querySelector(".items").appendChild(alarm);
  }

  connectedCallback() {
    if (!this.#intervalId) {
      this.#intervalId = setInterval(this.#intervalCallback, 1000);
    }
  }

  delete(alarm) {
  if (!this.alarms.includes(alarm)) {
    return;
  }

  const wasRinging = alarm.hasAttribute("ringing");

  alarm.remove();

  if (wasRinging) {
    this.dispatchEvent(
      new CustomEvent("silence", {
        bubbles: true,
        detail: alarm,
      }),
    );
  }
}

  disconnectedCallback() {
    clearInterval(this.#intervalId);
  }

  handleEvent(event) {
    const { target } = event;
    const { classList } = target;
    if (classList.contains("add")) {
      this.add();
    } else if (classList.contains("delete")) {
      this.delete(this.alarms.find((alarm) => alarm.contains(target)));
    } else if (classList.contains("pause")) {
      this.pause(this.alarms.find((alarm) => alarm.contains(target)));
    } else if (classList.contains("start")) {
      this.start(this.alarms.find((alarm) => alarm.contains(target)));
    }
  }

  pause(alarm) {
  if (!this.alarms.includes(alarm)) {
    return;
  }

  const wasRinging = alarm.hasAttribute("ringing");

  alarm.setAttribute("paused", "");
  alarm.removeAttribute("ringing");
  alarm.querySelector(".alarm-status").textContent = "Desactivada";

  if (wasRinging) {
    this.dispatchEvent(
      new CustomEvent("silence", {
        bubbles: true,
        detail: alarm,
      }),
    );
  }
}

  start(alarm) {
  if (!this.alarms.includes(alarm)) {
    return;
  }

  alarm.removeAttribute("paused");
  alarm.querySelector(".alarm-status").textContent = "Activada";

  // Comprueba inmediatamente si coincide con la hora actual
  this.#intervalCallback();
}
}
