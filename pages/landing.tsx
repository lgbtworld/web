import type { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import LandingPage from '../src/components/LandingPage';
import { SSRPage, type SSRPageProps, createSSRPageProps } from '../lib/ssr-props';

export const getServerSideProps: GetServerSideProps<SSRPageProps> = async (context) => ({
  props: await createSSRPageProps(context, '/landing'),
});

export default function Page(props: InferGetServerSidePropsType<typeof getServerSideProps>) {
  return (
    <SSRPage {...props}>
      <LandingPage />
    </SSRPage>
  );
}
