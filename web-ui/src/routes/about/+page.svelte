<script>
  import { version } from '$app/environment'

  import { Card, Heading, Badge, P } from 'flowbite-svelte';
</script>

<svelte:head>
  <title>Ayia > About</title>
  <meta name='description' content='Ayia Bible UI > About' />
</svelte:head>

<div class='flex flex-col w-full h-full py-4'>
  <Card size='md' class='bg-gray-100 dark:bg-gray-900 mx-auto h-full'>
    <Heading tag='h4' class='mb-4 flex items-center gap-4'>
      Ayia <Badge>v{ version }</Badge>
    </Heading>

    <P class='mb-3'>
      Ayia is a Bible study web application providing access to multiple
      English versions, including the Interlinear Berean Standard Bible.
    </P>

    <P class='mb-3'>
      The goal is to provide deeper insight into and understanding of God's
      word and what He has spoken.
    </P>
  </Card>
</div>
