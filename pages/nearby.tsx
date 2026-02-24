import type { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import NearbyScreen from '../src/components/NearbyScreen';
import { SSRPage, type SSRPageProps, createSSRPageProps } from '../lib/ssr-props';

export const getServerSideProps: GetServerSideProps<SSRPageProps> = async (context) => ({
  props: await createSSRPageProps(context, '/nearby'),
});

export default function Page(props: InferGetServerSidePropsType<typeof getServerSideProps>) {
  return (
    <SSRPage {...props}>
      <NearbyScreen />
    </SSRPage>
  );
}
