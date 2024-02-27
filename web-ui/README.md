# Ayia web-ui

A web-based Bible study application using:
- [Svelte](https://svelte.dev/docs/introduction);
- [Flowbite-svelte](https://flowbite-svelte.com/docs/pages/introduction),
  built on [Flowbite](https://flowbite.com/docs/getting-started/introduction/)
  (a [Tailwind](https://tailwindcss.com/docs/installation) component library).
  The use of Tailwind means we don't need any direct CSS styling within Svelte;

## Developing

During development, you'll need at least 2 terminals:
1.  To continuously (re)build the app as files are changed, serving them with
    hot module reloading;
    ```sh
    make dev      # or `npm run dev` or `npx vite dev`

    # To view the production app instead of the development app, use:
    make preview  # or `npm run preview` or `npx vite preview`
    ```
2.  To run your editor and any managment commands;

If you need to access the app from a browser on a different system, you can
make use of an `ssh` tunnel. There is an example in
[etc/port-forward](./etc/port-forward) that makes port 5173 on the remote
development machine (e.g. `op-vm`) available on your local host as port 5173.

You will also need access to the Ayia web-api server. There *should be* one
running at: https://api.ayia.nibious.com/

