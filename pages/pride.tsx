import type { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import HomeScreen from '../src/components/HomeScreen';
import { SSRPage, type SSRPageProps, createSSRPageProps } from '../lib/ssr-props';

export const getServerSideProps: GetServerSideProps<SSRPageProps> = async (context) => ({
  props: await createSSRPageProps(context, '/pride'),
});

export default function Page(props: InferGetServerSidePropsType<typeof getServerSideProps>) {
  return (
    <SSRPage {...props}>
      <HomeScreen />
    </SSRPage>
  );
}
