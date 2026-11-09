export class Clock {
  private svg: SVGSVGElement;
  private hourHand: SVGElement | null = null;
  private minuteHand: SVGElement | null = null;
  private secondHand: SVGElement | null = null;
  private animationFrameId: number | null = null;

  constructor(container: HTMLElement) {
    this.svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    this.svg.setAttribute('viewBox', '0 0 200 200');
    this.svg.setAttribute('class', 'clock-svg');
    this.renderDial();
    container.appendChild(this.svg);
  }

  private renderDial(): void {
    const cx = 100;
    const cy = 100;
    const radius = 94;

    // Dial background face
    const face = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    face.setAttribute('cx', String(cx));
    face.setAttribute('cy', String(cy));
    face.setAttribute('r', String(radius));
    face.setAttribute('class', 'clock-face');
    this.svg.appendChild(face);

    // Outer bezel ring
    const bezel = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    bezel.setAttribute('cx', String(cx));
    bezel.setAttribute('cy', String(cy));
    bezel.setAttribute('r', String(radius));
    bezel.setAttribute('class', 'clock-bezel');
    this.svg.appendChild(bezel);

    // Inner subtle ring
    const innerRing = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    innerRing.setAttribute('cx', String(cx));
    innerRing.setAttribute('cy', String(cy));
    innerRing.setAttribute('r', String(radius - 2));
    innerRing.setAttribute('class', 'clock-inner-ring');
    this.svg.appendChild(innerRing);

    // Tick marks group
    const ticksGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    ticksGroup.setAttribute('class', 'clock-ticks');

    for (let i = 0; i < 60; i++) {
      const angle = (i * 6 * Math.PI) / 180;
      const isHour = i % 5 === 0;
      const tickLength = isHour ? 9 : 4.5;
      const strokeWidth = isHour ? 2.5 : 1;

      const rOuter = radius - 5;
      const rInner = rOuter - tickLength;

      const x1 = cx + rOuter * Math.sin(angle);
      const y1 = cy - rOuter * Math.cos(angle);
      const x2 = cx + rInner * Math.sin(angle);
      const y2 = cy - rInner * Math.cos(angle);

      const tick = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      tick.setAttribute('x1', x1.toFixed(2));
      tick.setAttribute('y1', y1.toFixed(2));
      tick.setAttribute('x2', x2.toFixed(2));
      tick.setAttribute('y2', y2.toFixed(2));
      tick.setAttribute('stroke-width', String(strokeWidth));
      tick.setAttribute('stroke-linecap', 'round');
      tick.setAttribute('class', isHour ? 'tick-hour' : 'tick-minute');
      ticksGroup.appendChild(tick);
    }
    this.svg.appendChild(ticksGroup);

    // Hands group
    const handsGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    handsGroup.setAttribute('class', 'clock-hands');

    // Hour hand (length: 48, counterweight: 10)
    this.hourHand = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    this.hourHand.setAttribute('x1', '100');
    this.hourHand.setAttribute('y1', '110');
    this.hourHand.setAttribute('x2', '100');
    this.hourHand.setAttribute('y2', '52');
    this.hourHand.setAttribute('stroke-width', '4.5');
    this.hourHand.setAttribute('stroke-linecap', 'round');
    this.hourHand.setAttribute('class', 'hand-hour');
    handsGroup.appendChild(this.hourHand);

    // Minute hand (length: 70, counterweight: 12)
    this.minuteHand = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    this.minuteHand.setAttribute('x1', '100');
    this.minuteHand.setAttribute('y1', '112');
    this.minuteHand.setAttribute('x2', '100');
    this.minuteHand.setAttribute('y2', '28');
    this.minuteHand.setAttribute('stroke-width', '3');
    this.minuteHand.setAttribute('stroke-linecap', 'round');
    this.minuteHand.setAttribute('class', 'hand-minute');
    handsGroup.appendChild(this.minuteHand);

    // Second hand (fine needle, length: 78, counterweight: 18)
    this.secondHand = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    this.secondHand.setAttribute('x1', '100');
    this.secondHand.setAttribute('y1', '118');
    this.secondHand.setAttribute('x2', '100');
    this.secondHand.setAttribute('y2', '20');
    this.secondHand.setAttribute('stroke-width', '1.2');
    this.secondHand.setAttribute('stroke-linecap', 'round');
    this.secondHand.setAttribute('class', 'hand-second');
    handsGroup.appendChild(this.secondHand);

    // Center pivot cap
    const hubOuter = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    hubOuter.setAttribute('cx', '100');
    hubOuter.setAttribute('cy', '100');
    hubOuter.setAttribute('r', '4');
    hubOuter.setAttribute('class', 'clock-hub-outer');
    handsGroup.appendChild(hubOuter);

    const hubInner = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    hubInner.setAttribute('cx', '100');
    hubInner.setAttribute('cy', '100');
    hubInner.setAttribute('r', '1.8');
    hubInner.setAttribute('class', 'clock-hub-inner');
    handsGroup.appendChild(hubInner);

    this.svg.appendChild(handsGroup);
  }

  public start(): void {
    const tick = () => {
      this.updateHands();
      this.animationFrameId = requestAnimationFrame(tick);
    };
    tick();
  }

  public stop(): void {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  private updateHands(): void {
    const now = new Date();
    const ms = now.getMilliseconds();
    const sec = now.getSeconds() + ms / 1000;
    const min = now.getMinutes() + sec / 60;
    const hr = (now.getHours() % 12) + min / 60;

    const secAngle = sec * 6;
    const minAngle = min * 6;
    const hrAngle = hr * 30;

    if (this.secondHand) {
      this.secondHand.setAttribute('transform', `rotate(${secAngle} 100 100)`);
    }
    if (this.minuteHand) {
      this.minuteHand.setAttribute('transform', `rotate(${minAngle} 100 100)`);
    }
    if (this.hourHand) {
      this.hourHand.setAttribute('transform', `rotate(${hrAngle} 100 100)`);
    }
  }
}
