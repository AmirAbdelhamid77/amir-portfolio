---
title: Raw HTML fixture
---

<script>alert('xss')</script>

<p class="keep-me">Benign paragraph with <b>bold</b> and <sup>super</sup>.</p>

<div onclick="steal()" onmouseover='alsoSteal()'>Click targets</div>

<iframe src="https://evil.example/frame"></iframe>
