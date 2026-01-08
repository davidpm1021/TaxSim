import { ChangeDetectionStrategy, Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationService } from '@core/services';

@Component({
  selector: 'app-welcome',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="welcome-page">
      <!-- Animated background -->
      <div class="bg-gradient"></div>
      <div class="bg-pattern"></div>

      <!-- Floating elements -->
      <div class="floating-elements">
        <div class="float-item float-1">W-2</div>
        <div class="float-item float-2">1099</div>
        <div class="float-item float-3">$</div>
        <div class="float-item float-4">%</div>
        <div class="float-item float-5">IRS</div>
      </div>

      <main class="welcome-content" [class.visible]="contentVisible()">
        <!-- Hero Section -->
        <div class="hero-section">
          <div class="badge-row">
            <span class="edu-badge">
              <span class="badge-icon">&#x1F393;</span>
              Educational Simulation
            </span>
          </div>

          <h1 class="hero-title">
            <span class="title-line">Master Your</span>
            <span class="title-line title-accent">Tax Return</span>
          </h1>

          <p class="hero-subtitle">
            Experience filing taxes in a safe, guided simulation.
            No real data needed - just learning.
          </p>
        </div>

        <!-- Feature Cards -->
        <div class="features-grid">
          <div class="feature-card" [class.visible]="featuresVisible()">
            <div class="feature-icon">&#x1F4C4;</div>
            <h3>Read Tax Forms</h3>
            <p>Learn to decode W-2s, 1099s, and what each box means</p>
          </div>

          <div class="feature-card" [class.visible]="featuresVisible()" style="animation-delay: 0.1s">
            <div class="feature-icon">&#x1F4B0;</div>
            <h3>Understand Deductions</h3>
            <p>See how deductions reduce your taxable income</p>
          </div>

          <div class="feature-card" [class.visible]="featuresVisible()" style="animation-delay: 0.2s">
            <div class="feature-icon">&#x1F4CA;</div>
            <h3>Tax Brackets Demystified</h3>
            <p>Visualize how progressive taxation actually works</p>
          </div>

          <div class="feature-card" [class.visible]="featuresVisible()" style="animation-delay: 0.3s">
            <div class="feature-icon">&#x2705;</div>
            <h3>Refund or Owe?</h3>
            <p>Understand why you get money back or owe more</p>
          </div>
        </div>

        <!-- CTA Section -->
        <div class="cta-section" [class.visible]="ctaVisible()">
          <div class="simulation-notice">
            <span class="notice-icon">&#x1F6E1;</span>
            <span><strong>100% Safe:</strong> This is a simulation using fictional data from your worksheet.</span>
          </div>

          <button class="cta-button" (click)="getStarted()">
            <span class="btn-text">Start Your Tax Journey</span>
            <span class="btn-icon">&#x2192;</span>
          </button>

          <p class="time-estimate">
            <span class="clock-icon">&#x23F1;</span>
            Takes about 15-20 minutes
          </p>
        </div>
      </main>

      <!-- Footer branding -->
      <footer class="welcome-footer" [class.visible]="contentVisible()">
        <span class="footer-text">Powered by modern tax education</span>
      </footer>
    </div>
  `,
  styles: `
    .welcome-page {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      position: relative;
      overflow: hidden;
      padding: 2rem;
    }

    /* Background layers */
    .bg-gradient {
      position: fixed;
      inset: 0;
      background:
        radial-gradient(ellipse at 20% 20%, rgba(31, 59, 155, 0.15) 0%, transparent 50%),
        radial-gradient(ellipse at 80% 80%, rgba(29, 184, 232, 0.1) 0%, transparent 50%),
        radial-gradient(ellipse at 50% 50%, rgba(244, 173, 0, 0.05) 0%, transparent 70%),
        linear-gradient(135deg, #0a0f1c 0%, #0b1541 50%, #1a1f3a 100%);
      z-index: 0;
    }

    .bg-pattern {
      position: fixed;
      inset: 0;
      background-image:
        radial-gradient(rgba(255,255,255,0.03) 1px, transparent 1px);
      background-size: 40px 40px;
      z-index: 1;
    }

    /* Floating elements */
    .floating-elements {
      position: fixed;
      inset: 0;
      z-index: 2;
      pointer-events: none;
      overflow: hidden;
    }

    .float-item {
      position: absolute;
      font-weight: 800;
      color: rgba(255, 255, 255, 0.03);
      font-size: 4rem;
      animation: float 20s ease-in-out infinite;
    }

    .float-1 { top: 10%; left: 10%; animation-delay: 0s; font-size: 5rem; }
    .float-2 { top: 60%; left: 5%; animation-delay: -4s; font-size: 3.5rem; }
    .float-3 { top: 20%; right: 15%; animation-delay: -8s; font-size: 6rem; }
    .float-4 { top: 70%; right: 10%; animation-delay: -12s; font-size: 4rem; }
    .float-5 { top: 40%; left: 80%; animation-delay: -16s; font-size: 3rem; }

    @keyframes float {
      0%, 100% { transform: translate(0, 0) rotate(0deg); }
      25% { transform: translate(10px, -20px) rotate(5deg); }
      50% { transform: translate(-5px, 10px) rotate(-3deg); }
      75% { transform: translate(15px, 5px) rotate(3deg); }
    }

    /* Main content */
    .welcome-content {
      position: relative;
      z-index: 10;
      max-width: 900px;
      width: 100%;
      opacity: 0;
      transform: translateY(30px);
      transition: all 0.8s cubic-bezier(0.16, 1, 0.3, 1);

      &.visible {
        opacity: 1;
        transform: translateY(0);
      }
    }

    /* Hero section */
    .hero-section {
      text-align: center;
      margin-bottom: 3rem;
    }

    .badge-row {
      margin-bottom: 1.5rem;
    }

    .edu-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      background: rgba(244, 173, 0, 0.15);
      border: 1px solid rgba(244, 173, 0, 0.3);
      color: #f4ad00;
      padding: 0.5rem 1rem;
      border-radius: 100px;
      font-size: 0.875rem;
      font-weight: 600;
      letter-spacing: 0.02em;
    }

    .badge-icon {
      font-size: 1rem;
    }

    .hero-title {
      font-family: var(--font-heading);
      font-size: clamp(2.5rem, 8vw, 4.5rem);
      font-weight: 700;
      line-height: 1.1;
      margin-bottom: 1.5rem;
    }

    .title-line {
      display: block;
      color: white;
    }

    .title-accent {
      background: linear-gradient(135deg, #f4ad00 0%, #ff8c00 50%, #1db8e8 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .hero-subtitle {
      font-size: 1.25rem;
      color: rgba(255, 255, 255, 0.7);
      max-width: 500px;
      margin: 0 auto;
      line-height: 1.6;
    }

    /* Feature cards */
    .features-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1.25rem;
      margin-bottom: 3rem;
    }

    .feature-card {
      background: rgba(255, 255, 255, 0.03);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 16px;
      padding: 1.5rem;
      text-align: center;
      transition: all 0.3s ease;
      opacity: 0;
      transform: translateY(20px);

      &.visible {
        animation: fadeInUp 0.6s ease forwards;
      }

      &:hover {
        background: rgba(255, 255, 255, 0.06);
        border-color: rgba(255, 255, 255, 0.15);
        transform: translateY(-4px);
      }
    }

    @keyframes fadeInUp {
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .feature-icon {
      font-size: 2.5rem;
      margin-bottom: 0.75rem;
      display: block;
    }

    .feature-card h3 {
      color: white;
      font-size: 1rem;
      font-weight: 600;
      margin-bottom: 0.5rem;
    }

    .feature-card p {
      color: rgba(255, 255, 255, 0.5);
      font-size: 0.875rem;
      margin: 0;
      line-height: 1.5;
    }

    /* CTA section */
    .cta-section {
      text-align: center;
      opacity: 0;
      transform: translateY(20px);
      transition: all 0.6s ease 0.4s;

      &.visible {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .simulation-notice {
      display: inline-flex;
      align-items: center;
      gap: 0.75rem;
      background: rgba(16, 185, 129, 0.1);
      border: 1px solid rgba(16, 185, 129, 0.2);
      color: #10b981;
      padding: 0.75rem 1.25rem;
      border-radius: 12px;
      font-size: 0.9375rem;
      margin-bottom: 2rem;
    }

    .notice-icon {
      font-size: 1.25rem;
    }

    .cta-button {
      display: inline-flex;
      align-items: center;
      gap: 0.75rem;
      background: linear-gradient(135deg, #f4ad00 0%, #ff8c00 100%);
      color: #0b1541;
      border: none;
      border-radius: 100px;
      padding: 1.25rem 2.5rem;
      font-size: 1.125rem;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      box-shadow:
        0 4px 20px rgba(244, 173, 0, 0.3),
        0 0 0 0 rgba(244, 173, 0, 0.4);

      &:hover {
        transform: translateY(-3px) scale(1.02);
        box-shadow:
          0 8px 30px rgba(244, 173, 0, 0.4),
          0 0 0 4px rgba(244, 173, 0, 0.1);
      }

      &:active {
        transform: translateY(-1px) scale(1);
      }

      &:focus-visible {
        outline: 3px solid rgba(244, 173, 0, 0.5);
        outline-offset: 4px;
      }
    }

    .btn-icon {
      font-size: 1.25rem;
      transition: transform 0.3s ease;
    }

    .cta-button:hover .btn-icon {
      transform: translateX(4px);
    }

    .time-estimate {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      color: rgba(255, 255, 255, 0.4);
      font-size: 0.875rem;
      margin-top: 1.25rem;
    }

    .clock-icon {
      font-size: 1rem;
    }

    /* Footer */
    .welcome-footer {
      position: absolute;
      bottom: 2rem;
      left: 50%;
      transform: translateX(-50%);
      z-index: 10;
      opacity: 0;
      transition: opacity 0.6s ease 0.8s;

      &.visible {
        opacity: 1;
      }
    }

    .footer-text {
      color: rgba(255, 255, 255, 0.25);
      font-size: 0.75rem;
      letter-spacing: 0.05em;
      text-transform: uppercase;
    }

    /* Responsive */
    @media (max-width: 640px) {
      .welcome-page {
        padding: 1.5rem;
      }

      .features-grid {
        grid-template-columns: repeat(2, 1fr);
        gap: 1rem;
      }

      .feature-card {
        padding: 1.25rem 1rem;
      }

      .feature-icon {
        font-size: 2rem;
      }

      .cta-button {
        width: 100%;
        justify-content: center;
        padding: 1.125rem 2rem;
      }

      .simulation-notice {
        flex-direction: column;
        text-align: center;
        gap: 0.5rem;
      }
    }

    @media (max-width: 400px) {
      .features-grid {
        grid-template-columns: 1fr;
      }
    }
  `,
})
export class WelcomeComponent implements OnInit {
  private readonly navigation = inject(NavigationService);

  contentVisible = signal(false);
  featuresVisible = signal(false);
  ctaVisible = signal(false);

  ngOnInit(): void {
    // Stagger the animations
    setTimeout(() => this.contentVisible.set(true), 100);
    setTimeout(() => this.featuresVisible.set(true), 400);
    setTimeout(() => this.ctaVisible.set(true), 600);
  }

  getStarted(): void {
    this.navigation.goToNext();
  }
}
