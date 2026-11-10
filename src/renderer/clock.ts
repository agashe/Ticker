import {
  calculateAllTicks,
  calculateHandAngles,
  getRotationTransform
} from './clock-math';

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

    // Tick marks group rendered using pure geometry calculation
    const ticksGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    ticksGroup.setAttribute('class', 'clock-ticks');

    const ticks = calculateAllTicks({ cx, cy, radius });
    for (const tick of ticks) {
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', String(tick.x1));
      line.setAttribute('y1', String(tick.y1));
      line.setAttribute('x2', String(tick.x2));
      line.setAttribute('y2', String(tick.y2));
      line.setAttribute('stroke-width', String(tick.strokeWidth));
      line.setAttribute('stroke-linecap', 'round');
      line.setAttribute('class', tick.className);
      ticksGroup.appendChild(line);
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

  public updateHands(date: Date = new Date()): void {
    const { hour, minute, second } = calculateHandAngles(date);

    if (this.secondHand) {
      this.secondHand.setAttribute('transform', getRotationTransform(second));
    }
    if (this.minuteHand) {
      this.minuteHand.setAttribute('transform', getRotationTransform(minute));
    }
    if (this.hourHand) {
      this.hourHand.setAttribute('transform', getRotationTransform(hour));
    }
  }
}
