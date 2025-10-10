#!/usr/bin/perl

use strict;
use warnings;
use Text::CSV;
use Getopt::Long;
use File::Basename;
use Data::Dumper;

# Script version
my $VERSION = "1.0.0";

# Global variables for command line options
my ( $input_file, $output_file, $help, $verbose );

# Parse command line arguments
GetOptions(
    'input|i=s'  => \$input_file,
    'output|o=s' => \$output_file,
    'verbose|v'  => \$verbose,
    'help|h'     => \$help,
) or die("Error in command line arguments\n");

# Show help if requested or no input file provided
if ( $help || !$input_file ) {
    show_usage();
    exit(0);
}

# Check if input file exists
unless ( -e $input_file ) {
    die "Error: Input file '$input_file' does not exist\n";
}

# Set default output file if not specified
if ( !$output_file ) {
    $output_file = $input_file;
    $output_file =~ s/\.csv$/.kml/i;
    if ( $output_file eq $input_file ) {
        $output_file .= ".kml";
    }
}

# Main conversion process
print "CSV to KML Converter v$VERSION\n" if $verbose;
print "Reading CSV file: $input_file\n"  if $verbose;

my $records = read_csv_file($input_file);
print "Found " . scalar(@$records) . " records\n" if $verbose;

print "Grouping data by terminal...\n" if $verbose;
my $grouped_data = group_by_terminal($records);
print "Created " . scalar( keys %$grouped_data ) . " terminal groups\n"
  if $verbose;

print "Generating KML...\n" if $verbose;
my $kml_content = generate_kml($grouped_data);

print "Writing KML to: $output_file\n" if $verbose;
write_file( $output_file, $kml_content );

print "Conversion completed successfully!\n";

# Subroutines

sub show_usage {
    print <<'END_USAGE';
CSV to KML Converter

Usage: csv-to-kml.pl -i input.csv [-o output.kml] [-v] [-h]

Options:
    -i, --input   <file>   Input CSV file (required)
    -o, --output  <file>   Output KML file (default: input.kml)
    -v, --verbose          Verbose output
    -h, --help             Show this help message

CSV Format Expected:
    otrm    - Terminal ID (integer)
    termnm  - Terminal Name (string)
    city    - City (string)
    st      - State/Province (string)
    latdeg  - Latitude (float)
    londeg  - Longitude (float)
    cnt     - Count (integer)

Example:
    csv-to-kml.pl -i shippingcounts.csv -o shipping.kml -v

END_USAGE
}

sub read_csv_file {
    my ($filename) = @_;
    my @records;

    # Create CSV parser
    my $csv = Text::CSV->new(
        {
            binary    => 1,
            auto_diag => 1,
            sep_char  => ',',
        }
    );

    open( my $fh, '<:encoding(utf8)', $filename )
      or die "Cannot open file '$filename': $!\n";

    # Read header row
    my $header = $csv->getline($fh);
    unless ($header) {
        die "Error reading CSV header: " . $csv->error_diag() . "\n";
    }

    # Normalize header names (trim whitespace, lowercase)
    my @header_names = map { lc($_) =~ s/^\s+|\s+$//gr } @$header;

    # Validate required columns
    my @required_columns = qw(otrm termnm city st latdeg londeg cnt);
    my %header_index;

    for ( my $i = 0 ; $i < @header_names ; $i++ ) {
        $header_index{ $header_names[$i] } = $i;
    }

    foreach my $col (@required_columns) {
        unless ( exists $header_index{$col} ) {
            die "Error: Required column '$col' not found in CSV\n";
        }
    }

    # Read data rows
    while ( my $row = $csv->getline($fh) ) {
        my %record;

        # Map values to column names
        foreach my $col (@required_columns) {
            my $value = $row->[ $header_index{$col} ];

            # Trim whitespace
            $value =~ s/^\s+|\s+$//g if defined $value;

            # Convert to appropriate type
            if ( $col eq 'otrm' || $col eq 'cnt' ) {
                $record{$col} = int( $value || 0 );
            }
            elsif ( $col eq 'latdeg' || $col eq 'londeg' ) {
                $record{$col} = $value + 0;    # Convert to number
            }
            else {
                $record{$col} = $value || '';
            }
        }

        push @records, \%record;
    }

    close($fh);

    return \@records;
}

sub group_by_terminal {
    my ($records) = @_;
    my %grouped;

    foreach my $record (@$records) {
        my $terminal_name = uc( $record->{termnm} );

        if ( !exists $grouped{$terminal_name} ) {
            $grouped{$terminal_name} = [];
        }

        push @{ $grouped{$terminal_name} }, $record;
    }

    return \%grouped;
}

sub generate_kml {
    my ($grouped_data) = @_;

    my $kml = '<?xml version="1.0" encoding="UTF-8"?>' . "\n";
    $kml .= '<kml xmlns="http://www.opengis.net/kml/2.2">' . "\n";
    $kml .= '  <Document>' . "\n";
    $kml .= '    <name>Open Inventory</name>' . "\n";

    # Sort terminal names for consistent output
    foreach my $terminal_name ( sort keys %$grouped_data ) {
        $kml .= '    <Folder>' . "\n";
        $kml .= '      <name>' . xml_escape($terminal_name) . '</name>' . "\n";

        # Create placemarks for each location in the terminal
        foreach my $record ( @{ $grouped_data->{$terminal_name} } ) {
            $kml .= create_placemark($record);
        }

        $kml .= '    </Folder>' . "\n";
    }

    $kml .= '  </Document>' . "\n";
    $kml .= '</kml>';

    return $kml;
}

sub create_placemark {
    my ($record) = @_;

    my $city_state    = uc( $record->{city} ) . ', ' . uc( $record->{st} );
    my $terminal_info = $record->{otrm} . ' - ' . uc( $record->{termnm} );

    my $placemark = '    <Placemark>' . "\n";
    $placemark .=
        '      <name>'
      . xml_escape($city_state) . ' ('
      . $record->{cnt}
      . ' units)</name>' . "\n";
    $placemark .=
        '      <description>Open inventory for '
      . xml_escape($city_state)
      . '. Count: '
      . $record->{cnt}
      . '.</description>' . "\n";
    $placemark .= '      <ExtendedData>' . "\n";

    # Add extended data
    $placemark .= '        <Data name="Trm">' . "\n";
    $placemark .=
      '          <value>' . xml_escape($terminal_info) . '</value>' . "\n";
    $placemark .= '        </Data>' . "\n";

    $placemark .= '        <Data name="City">' . "\n";
    $placemark .=
        '          <value>'
      . xml_escape( uc( $record->{city} ) )
      . '</value>' . "\n";
    $placemark .= '        </Data>' . "\n";

    $placemark .= '        <Data name="State">' . "\n";
    $placemark .=
        '          <value>'
      . xml_escape( uc( $record->{st} ) )
      . '</value>' . "\n";
    $placemark .= '        </Data>' . "\n";

    $placemark .= '        <Data name="Count">' . "\n";
    $placemark .= '          <value>' . $record->{cnt} . '</value>' . "\n";
    $placemark .= '        </Data>' . "\n";

    $placemark .= '      </ExtendedData>' . "\n";
    $placemark .= '      <Point>' . "\n";
    $placemark .=
        '        <coordinates>'
      . $record->{londeg} . ','
      . $record->{latdeg}
      . ',0</coordinates>' . "\n";
    $placemark .= '      </Point>' . "\n";
    $placemark .= '    </Placemark>' . "\n";

    return $placemark;
}

sub xml_escape {
    my ($text) = @_;

    return '' unless defined $text;

    $text =~ s/&/&amp;/g;
    $text =~ s/</&lt;/g;
    $text =~ s/>/&gt;/g;
    $text =~ s/"/&quot;/g;
    $text =~ s/'/&apos;/g;

    return $text;
}

sub write_file {
    my ( $filename, $content ) = @_;

    open( my $fh, '>:encoding(UTF-8)', $filename )
      or die "Cannot open file '$filename' for writing: $!\n";

    print $fh $content;

    close($fh);
}

__END__

=head1 NAME

csv-to-kml.pl - Convert shipping counts CSV data to KML format

=head1 SYNOPSIS

csv-to-kml.pl -i input.csv [-o output.kml] [-v] [-h]

=head1 DESCRIPTION

This script converts CSV files containing shipping inventory data into KML
(Keyhole Markup Language) format for visualization in Google Earth or other
KML-compatible applications.

=head1 OPTIONS

=over 4

=item B<-i, --input> I<file>

Specifies the input CSV file (required).

=item B<-o, --output> I<file>

Specifies the output KML file. If not provided, uses the input filename
with a .kml extension.

=item B<-v, --verbose>

Enable verbose output for debugging.

=item B<-h, --help>

Display help message and exit.

=back

=head1 CSV FORMAT

The input CSV file must contain the following columns:

=over 4

=item * B<otrm> - Terminal ID (integer)

=item * B<termnm> - Terminal Name (string)

=item * B<city> - City (string)

=item * B<st> - State/Province (string)

=item * B<latdeg> - Latitude in decimal degrees (float)

=item * B<londeg> - Longitude in decimal degrees (float)

=item * B<cnt> - Inventory count (integer)

=back

=head1 EXAMPLES

Basic usage:

    csv-to-kml.pl -i shippingcounts.csv

With custom output file:

    csv-to-kml.pl -i shippingcounts.csv -o custom-output.kml

With verbose output:

    csv-to-kml.pl -i shippingcounts.csv -v

=head1 AUTHOR

CSV to KML Converter Script

=head1 LICENSE

This script is provided as-is under the MIT license.

=cut
