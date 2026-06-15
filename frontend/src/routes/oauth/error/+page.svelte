<script lang="ts">
    import { goto } from '$app/navigation';
</script>

<div class="flex justify-center items-center min-h-[50vh]">
    <div class="flex flex-col items-center max-w-80 p-8 rounded-xl border border-red-900/50 bg-slate-900/90 text-center shadow-lg">
        <div class="flex items-center justify-center w-12 h-12 rounded-full bg-red-500/10 text-red-500">
            <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
        </div>
        
        <h2 class="text-xl font-semibold text-red-500 mt-4">Authentication Failed</h2>
        <p class="text-slate-400 text-xs mt-2 leading-relaxed">
            We couldn't log you in via the third-party provider. This might be due to a canceled authorization or a temporary network issue.
        </p>

        <a href="/login" class="w-full mt-6 px-4 py-2 font-medium text-slate-200 bg-blue-500 rounded-md hover:bg-blue-600 transition text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
            Back to Login
        </a>
    </div>
</div>