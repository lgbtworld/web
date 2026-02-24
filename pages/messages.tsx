import type { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import MessagesScreen from '../src/components/MessagesScreen';
import { SSRPage, type SSRPageProps, createSSRPageProps } from '../lib/ssr-props';

export const getServerSideProps: GetServerSideProps<SSRPageProps> = async (context) => ({
  props: await createSSRPageProps(context, '/messages'),
});

export default function Page(props: InferGetServerSidePropsType<typeof getServerSideProps>) {
  return (
    <SSRPage {...props}>
      <MessagesScreen />
    </SSRPage>
  );
}
