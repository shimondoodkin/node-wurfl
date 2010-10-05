rm /tmp/wurfl-latest.xml.gz
rm /tmp/wurfl-latest.xml
wget  -O /tmp/wurfl-latest.xml.gz  http://sourceforge.net/projects/wurfl/files/WURFL/latest/wurfl-latest.xml.gz/download 
gunzip /tmp/wurfl-latest.xml.gz
script_directory=`dirname "$0"`;
cd $script_directory;
mv -f /tmp/wurfl-latest.xml ./

