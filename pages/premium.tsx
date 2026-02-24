import type { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import PremiumScreen from '../src/components/PremiumScreen';
import { SSRPage, type SSRPageProps, createSSRPageProps } from '../lib/ssr-props';

export const getServerSideProps: GetServerSideProps<SSRPageProps> = async (context) => ({
  props: await createSSRPageProps(context, '/premium'),
});

export default function Page(props: InferGetServerSidePropsType<typeof getServerSideProps>) {
  return (
    <SSRPage {...props}>
      <PremiumScreen />
    </SSRPage>
  );
}
