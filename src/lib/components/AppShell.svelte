<script lang="ts">
	import BottomNav from './BottomNav.svelte';

	let { children } = $props();
</script>

<div class="min-h-screen pb-24 text-[#10231d] sm:pb-28">
	{@render children()}
</div>

<BottomNav />
