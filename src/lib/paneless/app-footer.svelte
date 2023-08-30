
<script lang="ts">
	import { appStatus }	from './stores';

	let status = '';

	appStatus.subscribe ( v => {
		status = v;
	})
</script>

<app-footer>
	<div class = "app-footer-status">
		{ status }
	</div>
</app-footer>

<style>
	app-footer {
	}
	.app-footer-status {
		margin-left:	10px;
		margin-top:		6px;
		font-family:	Verdana, Geneva, Tahoma, sans-serif;
		font-size:		10px;
	}
</style>

