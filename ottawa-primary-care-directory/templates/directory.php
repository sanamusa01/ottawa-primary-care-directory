<?php
/** Generated directory template. Variables are supplied by the shortcode. */
defined( 'ABSPATH' ) || exit;
?>
<div id="ottrx-root" class="ottrx ottrx--wordpress" lang="<?php echo esc_attr( $directory_language ); ?>" data-data-url="<?php echo esc_url( $directory_data_url ); ?>" data-leaflet-css="<?php echo esc_url( $leaflet_css_url ); ?>" data-leaflet-js="<?php echo esc_url( $leaflet_js_url ); ?>" aria-busy="true">
  <a class="ottrx__skip" href="#ottrx-panel">Skip to directory content</a>

  <header class="ottrx__head">
    <p class="ottrx__eyebrow" data-i18n="eyebrow">Ottawa Ontario Health Team · Primary Care Network</p>
    <h1 class="ottrx__title" data-i18n="title">Referral &amp; Resource Directory</h1>
    <div class="ottrx__headtools">
      <a class="ottrx__feedback" data-feedback="" href="mailto:info@ottawaoht-eso.com?subject=Directory%20correction%3A%20Referral%20routes&amp;body=Hi%2C%0A%0AI%20found%20something%20in%20the%20directory%20that%20needs%20fixing.%0A%0AWhich%20entry%3A%0A%0AWhat%20is%20wrong%3A%0A%0AWhat%20it%20should%20say%20(if%20you%20know)%3A%0A%0AThanks%2C">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">
          <path d="M4 5h16v11H8l-4 4V5z"></path>
        </svg>
        <span data-i18n="feedback.cta">See anything that needs to change? Let us know</span>
      </a>
      <div class="ottrx__lang" role="group" aria-label="Language / Langue">
        <button type="button" class="ottrx__langbtn is-on" data-lang="en" aria-pressed="true">English</button>
        <button type="button" class="ottrx__langbtn" data-lang="fr" aria-pressed="false">French</button>
      </div>
    </div>
    <p class="ottrx__frnote" data-frnote="" hidden=""></p>
  </header>

  <div class="ottrx__bar">
    <div class="ottrx__searchwrap">
      <svg class="ottrx__searchicon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true" focusable="false">
        <circle cx="11" cy="11" r="7"></circle><path d="m20 20-3.5-3.5"></path>
      </svg>
      <label class="ottrx__sr" for="ottrx-search" data-i18n="search.label">Search the directory</label>
      <input class="ottrx__search" id="ottrx-search" type="search" data-search="" autocomplete="off" data-i18n-ph="search.ph" placeholder="Search everything — specialty, physician, clinic, form, phone number…">
      <button type="button" class="ottrx__clear" data-clear="" data-i18n-al="search.clear" aria-label="Clear search">×</button>
    </div>
    <div class="ottrx__tabs" role="tablist" aria-label="Directory sections" data-tabs=""><button type="button" class="ottrx__tab" role="tab" id="ottrx-tab-all" aria-controls="ottrx-panel" aria-selected="false" tabindex="-1" data-tab="all">Search everything</button><button type="button" class="ottrx__tab" role="tab" id="ottrx-tab-referral" aria-controls="ottrx-panel" aria-selected="true" tabindex="0" data-tab="referral">Referral routes</button><button type="button" class="ottrx__tab" role="tab" id="ottrx-tab-map" aria-controls="ottrx-panel" aria-selected="false" tabindex="-1" data-tab="map">Map</button><button type="button" class="ottrx__tab" role="tab" id="ottrx-tab-specialists" aria-controls="ottrx-panel" aria-selected="false" tabindex="-1" data-tab="specialists">Specialists</button><button type="button" class="ottrx__tab" role="tab" id="ottrx-tab-services" aria-controls="ottrx-panel" aria-selected="false" tabindex="-1" data-tab="services">Clinics &amp; services</button><button type="button" class="ottrx__tab" role="tab" id="ottrx-tab-fax" aria-controls="ottrx-panel" aria-selected="false" tabindex="-1" data-tab="fax">Fax lookup</button><button type="button" class="ottrx__tab" role="tab" id="ottrx-tab-forms" aria-controls="ottrx-panel" aria-selected="false" tabindex="-1" data-tab="forms">Forms</button><button type="button" class="ottrx__tab" role="tab" id="ottrx-tab-resources" aria-controls="ottrx-panel" aria-selected="false" tabindex="-1" data-tab="resources">Resources</button><button type="button" class="ottrx__tab" role="tab" id="ottrx-tab-quick" aria-controls="ottrx-panel" aria-selected="false" tabindex="-1" data-tab="quick">Quick numbers</button></div>
  </div>

  <main class="ottrx__panel" id="ottrx-panel" role="tabpanel" tabindex="-1" data-panel aria-labelledby="ottrx-tab-referral"><div class="ottrx__loading" role="status" aria-live="polite"><span class="ottrx__spinner" aria-hidden="true"></span><span>Loading directory…</span></div><noscript><div class="ottrx__warn">JavaScript is required to use this interactive directory.</div></noscript></main>

  <footer class="ottrx__foot">
    <div class="ottrx__footcta">
      <p data-i18n="feedback.blurb"><strong>Found something wrong, missing or out of date?</strong> A bad fax number or a retired intake pathway delays a patient. Tell us and we will fix it — you do not need to be sure, just tell us what looked off.</p>
      <a class="ottrx__feedback" data-feedback="" href="mailto:info@ottawaoht-eso.com?subject=Directory%20correction%3A%20Referral%20routes&amp;body=Hi%2C%0A%0AI%20found%20something%20in%20the%20directory%20that%20needs%20fixing.%0A%0AWhich%20entry%3A%0A%0AWhat%20is%20wrong%3A%0A%0AWhat%20it%20should%20say%20(if%20you%20know)%3A%0A%0AThanks%2C">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">
          <path d="M4 5h16v11H8l-4 4V5z"></path>
        </svg>
        <span data-i18n="feedback.cta">See anything that needs to change? Let us know</span>
      </a>
    </div>

  </footer>
</div>
