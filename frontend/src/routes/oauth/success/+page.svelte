<script lang="ts">
    import { onMount } from 'svelte';
    import { goto } from '$app/navigation';
    import { showToast } from '$lib/shared/toast.svelte';

    onMount(() => {
        showToast("Successfully authenticated via OAuth!");
        
        // 留出一点点时间给用户展示动画或处理状态，然后跳转
        const timer = setTimeout(() => {
            window.location.href = '/modes';
        }, 1200);

        return () => clearTimeout(timer);
    });
</script>

<div class="flex justify-center items-center min-h-[50vh]">
    <div class="flex flex-col items-center max-w-80 p-8 rounded-xl border border-slate-700 bg-slate-900/90 text-center">
        <div class="w-12 h-12 border-4 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
        
        <h2 class="text-xl font-semibold text-pink-500 mt-6">Connecting...</h2>
        <p class="text-slate-400 text-xs mt-2">Securing your session and redirecting you to the dashboard.</p>
    </div>
</div>