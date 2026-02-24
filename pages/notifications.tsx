import type { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import NotificationsScreen from '../src/components/NotificationsScreen';
import { SSRPage, type SSRPageProps, createSSRPageProps } from '../lib/ssr-props';

export const getServerSideProps: GetServerSideProps<SSRPageProps> = async (context) => ({
  props: await createSSRPageProps(context, '/notifications'),
});

export default function Page(props: InferGetServerSidePropsType<typeof getServerSideProps>) {
  return (
    <SSRPage {...props}>
      <NotificationsScreen />
    </SSRPage>
  );
}
