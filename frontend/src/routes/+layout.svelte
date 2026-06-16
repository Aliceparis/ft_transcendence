<script lang="ts">
	import "../app.css";
	import { page } from '$app/state';
	import { toast } from '$lib/shared/toast.svelte'
	import { showToast } from '$lib/shared/toast.svelte'
	import { onMount } from 'svelte'
	import { connectWS } from '$lib/websocket/friendship'
	import { connectWS as connectChatWS } from '$lib/websocket/chat'
	import { disconnectWS } from '$lib/websocket/chat'
	import { unreadMap, initUnread, incrementUnread } from '$lib/stores/unread'
	import type { Socket } from "socket.io-client";

	let props = $props();
	let socket: Socket | null = null;
	const totalUnread = $derived(Object.values($unreadMap).reduce((sum, count) => sum + count, 0));

	onMount(() => {
		if (props.data.connected && !socket) {
			socket = connectWS();
			const { socket: chatSocket } = connectChatWS();
			chatSocket.on('unread_count', (data) => {
				const currentUserId = page.url.searchParams.get('with');
				const filtered = data.perSender.filter((e: {senderId: number, count: number}) => String(e.senderId) !== currentUserId);
				initUnread(filtered);
			}),
			chatSocket.on('message_received', (data) => {
				const currentUserId = page.url.searchParams.get('with');
				if (data.senderId !== currentUserId) incrementUnread(data.senderId);
			});
		}
		return () => {
			socket?.disconnect();
			disconnectWS();
			socket = null;
		};
	});

	async function handleLogout() {
		try {
			const response = await fetch('/api/auth/logout', {
				method: 'POST',
				credentials: 'include'
			});
			if (!response.ok) return;
			socket?.disconnect();
			disconnectWS();
			window.location.href = '/?logout=true';
		} catch {
			showToast("Sorry, an internal error has occurred. Please try again later.");
		}
	}
</script>

<div class="template">
	<!-- Header -->
	<header class="flex h-24 w-full items-center p-4">
		<!-- Logo -->
		<div class="flex-1">
			<a href={props.data.connected ? '/modes' : '/'} class="inline-block">
				<img src="/images/logo.png" alt="logo" class="h-24 w-auto drop-shadow-[0_0_20px_blue]"/>
			</a>
		</div>

		<!-- Title -->
		<div class="flex-1 text-center text-xl sm:text-4xl font-bold text-pink-500 drop-shadow-[0_0_20px_blue]">
			<a href={props.data.connected ? '/modes' : '/'}>42Brain</a>
			<h2 class="text-xs sm:text-sm font-semibold text-pink-500 text-center">Your number one quiz plateform !</h2>
		</div>

		<!-- Dynamic drop-down menu -->
		<el-dropdown class="flex flex-1 justify-end">
			<button class="cursor-pointer inline-flex gap-x-1.5 rounded-md px-3 py-2 text-sm font-semibold text-pink-500 drop-shadow-[10px_10px_5px_blue] hover:text-blue-500 hover:drop-shadow-[10px_10px_15px_#FF1D8D]">
				Menu
				<svg viewBox="0 0 20 20" fill="currentColor" data-slot="icon" aria-hidden="true" class="-mr-1 size-5 text-gray-400">
					<path d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z" clip-rule="evenodd" fill-rule="evenodd" />
				</svg>
			</button>
			<el-menu anchor="bottom end" popover="manual" class="w-25 origin-top-right rounded-md bg-black outline-1 -outline-offset-1 outline-white/10 transition transition-discrete [--anchor-gap:--spacing(2)] data-closed:scale-95 data-closed:transform data-closed:opacity-0 data-enter:duration-100 data-enter:ease-out data-leave:duration-75 data-leave:ease-in">
				<div class="py-1">
					{#if !props.data.connected}
						<!-- 未登录：根据当前页面显示对应链接 -->
						{#if page.url.pathname === '/'}
							<a href="/register" class="block text-center py-2 text-sm text-pink-500 hover:text-blue-500 focus:text-blue-500 focus:outline-hidden">Sign Up</a>
						{:else if page.url.pathname === '/register'}
							<a href="/" class="block text-center py-2 text-sm text-pink-500 hover:text-blue-500 focus:text-blue-500 focus:outline-hidden">Sign In</a>
						{:else}
							<a href="/" class="block text-center py-2 text-sm text-pink-500 hover:text-blue-500 focus:text-blue-500 focus:outline-hidden">Sign In</a>
							<a href="/register" class="block text-center py-2 text-sm text-pink-500 hover:text-blue-500 focus:text-blue-500 focus:outline-hidden">Sign Up</a>
						{/if}
					{:else}
						<!-- 已登录：根据当前页面显示导航 -->
						{#if page.url.pathname !== '/modes'}
							<a href="/modes" class="block text-center py-2 text-sm text-pink-500 hover:text-blue-500 focus:text-blue-500 focus:outline-hidden">Game</a>
						{/if}
						{#if page.url.pathname !== '/profile'}
							<a href="/profile" class="block text-center py-2 text-sm text-pink-500 hover:text-blue-500 focus:text-blue-500 focus:outline-hidden">Profile</a>
						{/if}
						{#if page.url.pathname !== '/friends'}
							<a href="/friends" class="block text-center py-2 text-sm text-pink-500 hover:text-blue-500 focus:text-blue-500 focus:outline-hidden">Friends
								{#if totalUnread > 0}
									<span class="inline-flex items-center justify-center w-4 h-4 text-xs font-bold text-white bg-blue-500 rounded-full">
										{totalUnread}
									</span>
								{/if}
							</a>
						{/if}
						<button onclick={() => handleLogout()} class="block cursor-pointer w-full py-2 text-center text-sm text-pink-500 hover:text-blue-500 focus:bg-white/5 focus:text-blue-500 focus:outline-hidden">Logout</button>
					{/if}
				</div>
			</el-menu>
		</el-dropdown>
	</header>

	<!-- Content -->
	<main class="flex flex-1 justify-center items-center p-4">
		{@render props.children()}
	</main>

	<!-- Footer -->
	<footer class="flex justify-center gap-8 mt-auto text-xs text-pink-500">
		<a href="/terms_of_service" class="hover:text-blue-500">TERMS OF SERVICE</a>
		<a href="/privacy_policy" class="hover:text-blue-500">PRIVACY POLICY</a>
	</footer>

	<!-- Toast notification -->
	{#if toast.message}
		<div class="fixed bottom-6 right-6 bg-pink-500 text-white px-4 py-2 rounded-md shadow-lg">
			{toast.message}
		</div>
	{/if}
</div>