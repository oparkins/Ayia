<script>
  import { get }  from 'svelte/store';

  import {
    Card,
    Table,
    TableBody,
    TableBodyCell,
    TableBodyRow,
    TableHead,
    TableHeadCell,
    Checkbox,
    TableSearch,
  } from 'flowbite-svelte';

  import { theme, versions, verse, user } from '$lib/stores.js';
</script>

<svelte:head>
  <title>Ayia > Settings</title>
  <meta name='description' content='Ayia Bible UI > Settings' />
</svelte:head>

<div class='flex flex-col w-full h-full py-4'>
  <Card size='md' class='bg-gray-100 dark:bg-gray-900 mx-auto h-full'>

    <Table striped={true}>
      <TableHead>
        <TableHeadCell class='w-[10ch]'>Name</TableHeadCell>
        <TableHeadCell class='w-full'>Value</TableHeadCell>
      </TableHead>
      <TableBody>
        <TableBodyRow>
          <TableBodyCell><b>theme</b></TableBodyCell>
          <TableBodyCell>{ $theme }</TableBodyCell>
        </TableBodyRow>
        <TableBodyRow>
          <TableBodyCell><b>versions</b></TableBodyCell>
          <TableBodyCell>
						{ $versions ? $versions.total : -1 }
          </TableBodyCell>
        </TableBodyRow>
        <TableBodyRow>
          <TableBodyCell><b>verse</b></TableBodyCell>
          <TableBodyCell>
            <pre>{ JSON.stringify( $verse, null, 2 ) }</pre>
          </TableBodyCell>
        </TableBodyRow>
        <TableBodyRow>
          <TableBodyCell><b>user</b></TableBodyCell>
          <TableBodyCell>
            <pre>{ JSON.stringify( $user, null, 2 ) }</pre>
          </TableBodyCell>
        </TableBodyRow>
      </TableBody>
    </Table>
  </Card>
</div>
